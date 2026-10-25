import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import { db } from './server/db.js';

const app = express();
const PORT = 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Ensure uploads folder exists
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer storage for persistent image uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${cleanName}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WEBP, and GIF images are permitted.'));
    }
  }
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded media statically
app.use('/uploads', express.static(UPLOADS_DIR));

// Simple in-memory session tokens store
const activeSessions = new Map<string, { userId: string; username: string; expiresAt: number }>();

function createSession(userId: string, username: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  activeSessions.set(token, { userId, username, expiresAt });
  return token;
}

// Authentication middleware
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: missing or invalid authorization token' });
  }

  const token = authHeader.substring(7);
  const session = activeSessions.get(token);

  if (!session || session.expiresAt < Date.now()) {
    if (session) activeSessions.delete(token);
    return res.status(401).json({ error: 'Session expired or invalid, please sign in again' });
  }

  (req as any).user = session;
  next();
}

// ================= API ROUTES =================

// --- Admin Auth ---
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  const ip = req.ip || req.socket.remoteAddress || 'unknown';

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const attemptCheck = db.recordLoginAttempt(ip, false);
  if (!attemptCheck.allowed) {
    return res.status(429).json({
      error: `Too many failed attempts. Account temporarily locked. Please try again in ${attemptCheck.remainingLockoutSeconds} seconds.`
    });
  }

  const user = db.getUserByUsername(username);
  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const isMatch = bcrypt.compareSync(password, user.password_hash);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  // Clear failed login attempts upon success
  db.recordLoginAttempt(ip, true);

  const token = createSession(user.id, user.username);
  return res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      must_change_password: user.must_change_password
    }
  });
});

app.post('/api/admin/logout', requireAuth, (req: Request, res: Response) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.substring(7);
  activeSessions.delete(token);
  return res.json({ success: true, message: 'Logged out successfully' });
});

app.get('/api/admin/me', requireAuth, (req: Request, res: Response) => {
  const session = (req as any).user;
  const user = db.getUserById(session.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  return res.json({
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      must_change_password: user.must_change_password
    }
  });
});

app.post('/api/admin/change-password', requireAuth, (req: Request, res: Response) => {
  const session = (req as any).user;
  const { current_password, new_password, confirm_password } = req.body;

  if (!current_password || !new_password) {
    return res.status(400).json({ error: 'Current password and new password are required' });
  }

  if (new_password !== confirm_password) {
    return res.status(400).json({ error: 'New passwords do not match' });
  }

  if (new_password.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters long' });
  }

  const user = db.getUserById(session.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const isMatch = bcrypt.compareSync(current_password, user.password_hash);
  if (!isMatch) {
    return res.status(400).json({ error: 'Current password is incorrect' });
  }

  const newHash = bcrypt.hashSync(new_password, 10);
  db.updateUserPassword(user.id, newHash);

  return res.json({ success: true, message: 'Password updated successfully' });
});

// --- Dashboard Stats ---
app.get('/api/admin/stats', requireAuth, (_req: Request, res: Response) => {
  const stats = db.getDashboardStats();
  return res.json(stats);
});

// --- Products (Public & Admin) ---
app.get('/api/products', (req: Request, res: Response) => {
  const { category, search, status, is_featured, is_hot_deal, sort, limit, offset } = req.query;

  const result = db.getProducts({
    category_id: category as string,
    search: search as string,
    status: (status as string) || 'published', // default public to published
    is_featured: is_featured === 'true' ? true : undefined,
    is_hot_deal: is_hot_deal === 'true' ? true : undefined,
    sort: (sort as any) || 'newest',
    limit: limit ? parseInt(limit as string, 10) : undefined,
    offset: offset ? parseInt(offset as string, 10) : undefined
  });

  return res.json(result);
});

app.get('/api/admin/products', requireAuth, (req: Request, res: Response) => {
  const { category, search, status, sort, limit, offset } = req.query;

  const result = db.getProducts({
    category_id: category as string,
    search: search as string,
    status: status as string, // empty string means all statuses
    sort: (sort as any) || 'newest',
    limit: limit ? parseInt(limit as string, 10) : undefined,
    offset: offset ? parseInt(offset as string, 10) : undefined
  });

  return res.json(result);
});

app.get('/api/products/:slugOrId', (req: Request, res: Response) => {
  const detail = db.getProductByIdOrSlug(req.params.slugOrId);
  if (!detail) {
    return res.status(404).json({ error: 'Product deal not found' });
  }

  // Also fetch 4 related products in same category
  const related = db.getProducts({
    category_id: detail.product.category_id,
    status: 'published',
    limit: 5
  }).products.filter(p => p.id !== detail.product.id).slice(0, 4);

  return res.json({
    ...detail,
    related
  });
});

app.post('/api/products', requireAuth, (req: Request, res: Response) => {
  const {
    title,
    title_bn,
    slug,
    short_description,
    full_description,
    category_id,
    original_price,
    deal_price,
    product_source,
    destination_url,
    affiliate_url,
    primary_image,
    gallery_images,
    is_featured,
    is_hot_deal,
    status,
    expires_at,
    tags
  } = req.body;

  if (!title || !category_id || original_price === undefined || deal_price === undefined) {
    return res.status(400).json({ error: 'Title, category, original price, and deal price are required' });
  }

  if (Number(original_price) <= 0 || Number(deal_price) <= 0) {
    return res.status(400).json({ error: 'Prices must be positive numbers' });
  }

  const generatedSlug = (slug || title)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '') || `deal-${Date.now()}`;

  const product = db.createProduct({
    title,
    title_bn: title_bn || '',
    slug: generatedSlug,
    short_description: short_description || '',
    full_description: full_description || short_description || '',
    category_id,
    original_price: Number(original_price),
    deal_price: Number(deal_price),
    product_source: product_source || 'Daraz Bangladesh',
    destination_url: destination_url || '',
    affiliate_url: affiliate_url || destination_url || '',
    primary_image: primary_image || '',
    gallery_images: gallery_images || [],
    is_featured: !!is_featured,
    is_hot_deal: !!is_hot_deal,
    status: status === 'draft' ? 'draft' : 'published',
    expires_at: expires_at || null,
    tags: Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((t: string) => t.trim()).filter(Boolean) : []
  });

  return res.status(201).json(product);
});

app.put('/api/products/:id', requireAuth, (req: Request, res: Response) => {
  const updated = db.updateProduct(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Product not found' });
  }
  return res.json(updated);
});

app.delete('/api/products/:id', requireAuth, (req: Request, res: Response) => {
  const deleted = db.deleteProduct(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Product not found' });
  }
  return res.json({ success: true, message: 'Product deleted successfully' });
});

// --- Categories ---
app.get('/api/categories', (_req: Request, res: Response) => {
  const categories = db.getCategories();
  return res.json(categories);
});

app.post('/api/categories', requireAuth, (req: Request, res: Response) => {
  const { name, name_bn, slug, status, sort_order } = req.body;
  if (!name) return res.status(400).json({ error: 'Category name is required' });

  const cleanSlug = (slug || name)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-');

  const cat = db.createCategory({
    name,
    name_bn: name_bn || '',
    slug: cleanSlug,
    status: status === 'inactive' ? 'inactive' : 'active',
    sort_order: Number(sort_order) || db.getCategories().length + 1
  });

  return res.status(201).json(cat);
});

app.put('/api/categories/:id', requireAuth, (req: Request, res: Response) => {
  const updated = db.updateCategory(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Category not found' });
  return res.json(updated);
});

app.delete('/api/categories/:id', requireAuth, (req: Request, res: Response) => {
  const deleted = db.deleteCategory(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Category not found' });
  return res.json({ success: true, message: 'Category deleted successfully' });
});

app.post('/api/categories/reorder', requireAuth, (req: Request, res: Response) => {
  const { ordered_ids } = req.body;
  if (!Array.isArray(ordered_ids)) {
    return res.status(400).json({ error: 'ordered_ids array is required' });
  }
  const result = db.reorderCategories(ordered_ids);
  return res.json(result);
});

// --- Banners ---
app.get('/api/banners', (req: Request, res: Response) => {
  const { all } = req.query;
  const banners = db.getBanners();
  if (all === 'true') {
    return res.json(banners);
  }
  const now = new Date().toISOString();
  // Filter active and within date range if set
  const activeBanners = banners.filter(b => {
    if (!b.is_active) return false;
    if (b.start_at && b.start_at > now) return false;
    if (b.end_at && b.end_at < now) return false;
    return true;
  });
  return res.json(activeBanners);
});

app.post('/api/banners', requireAuth, (req: Request, res: Response) => {
  const { title, image_url, mobile_image_url, destination_url, placement, start_at, end_at, is_active, sort_order } = req.body;
  if (!title || !image_url) {
    return res.status(400).json({ error: 'Title and image URL are required' });
  }

  const banner = db.createBanner({
    title,
    image_url,
    mobile_image_url: mobile_image_url || image_url,
    destination_url: destination_url || '',
    placement: placement || 'top_header',
    start_at: start_at || null,
    end_at: end_at || null,
    is_active: is_active !== false,
    sort_order: Number(sort_order) || db.getBanners().length + 1
  });

  return res.status(201).json(banner);
});

app.put('/api/banners/:id', requireAuth, (req: Request, res: Response) => {
  const updated = db.updateBanner(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Banner not found' });
  return res.json(updated);
});

app.delete('/api/banners/:id', requireAuth, (req: Request, res: Response) => {
  const deleted = db.deleteBanner(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Banner not found' });
  return res.json({ success: true, message: 'Banner deleted successfully' });
});

app.post('/api/banners/reorder', requireAuth, (req: Request, res: Response) => {
  const { ordered_ids } = req.body;
  if (!Array.isArray(ordered_ids)) {
    return res.status(400).json({ error: 'ordered_ids array is required' });
  }
  const result = db.reorderBanners(ordered_ids);
  return res.json(result);
});

// --- Adsterra Ad Placements ---
app.get('/api/ads', (_req: Request, res: Response) => {
  const ads = db.getAdPlacements();
  return res.json(ads);
});

app.get('/api/admin/ads', requireAuth, (_req: Request, res: Response) => {
  const ads = db.getAdPlacements();
  return res.json(ads);
});

app.put('/api/admin/ads/:id', requireAuth, (req: Request, res: Response) => {
  const updated = db.updateAdPlacement(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Ad placement not found' });
  return res.json(updated);
});

// --- Settings ---
app.get('/api/settings', (_req: Request, res: Response) => {
  return res.json(db.getSettings());
});

app.put('/api/admin/settings', requireAuth, (req: Request, res: Response) => {
  const updated = db.updateSettings(req.body);
  return res.json(updated);
});

// --- Image Upload ---
app.post('/api/upload', requireAuth, upload.single('image'), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  return res.json({
    url: fileUrl,
    filename: req.file.filename,
    size: req.file.size,
    mimetype: req.file.mimetype
  });
});

// --- Front-end Integration (Vite in Dev, Dist in Prod) ---
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Halka Price Deals Platform Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
