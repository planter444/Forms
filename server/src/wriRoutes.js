import express from "express";
import multer from "multer";
import { pool } from "./db.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/public/settings", async (req, res) => {
  try {
    const result = await pool.query("SELECT settings FROM solar_mkononi_settings WHERE id = 'default'");
    const settings = result.rows[0]?.settings || {};
    const wriSettings = settings.wri || {};
    res.json(wriSettings);
  } catch (error) {
    console.error("Error fetching WRI settings:", error);
    res.status(500).json({ error: "Failed to fetch WRI settings" });
  }
});

router.post("/enquiries", upload.single("attachment"), async (req, res) => {
  try {
    const { name, organisation, country, email, phone, organisation_type, technology_sector, area_of_interest, enquiry_type, message } = req.body;
    
    if (!name || !organisation || !country || !email || !organisation_type || !technology_sector || !area_of_interest || !enquiry_type || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const attachmentUrl = req.file ? `/uploads/wri/${Date.now()}_${req.file.originalname}` : "";
    const attachmentName = req.file ? req.file.originalname : "";

    const result = await pool.query(
      `INSERT INTO wri_partnership_enquiries 
       (name, organisation, country, email, phone, organisation_type, technology_sector, area_of_interest, enquiry_type, message, attachment_url, attachment_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [name, organisation, country, email, phone || "", organisation_type, technology_sector, area_of_interest, enquiry_type, message, attachmentUrl, attachmentName]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating WRI enquiry:", error);
    res.status(500).json({ error: "Failed to create enquiry" });
  }
});

router.get("/admin/enquiries", async (req, res) => {
  try {
    const { status } = req.query;
    let query = "SELECT * FROM wri_partnership_enquiries";
    const params = [];
    
    if (status) {
      query += " WHERE status = $1";
      params.push(status);
    }
    
    query += " ORDER BY created_at DESC";
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching WRI enquiries:", error);
    res.status(500).json({ error: "Failed to fetch enquiries" });
  }
});

router.put("/admin/enquiries/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const result = await pool.query(
      "UPDATE wri_partnership_enquiries SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
      [status, id]
    );
    
    if (!result.rowCount) {
      return res.status(404).json({ error: "Enquiry not found" });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating WRI enquiry:", error);
    res.status(500).json({ error: "Failed to update enquiry" });
  }
});

router.delete("/admin/enquiries/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM wri_partnership_enquiries WHERE id = $1", [id]);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting WRI enquiry:", error);
    res.status(500).json({ error: "Failed to delete enquiry" });
  }
});

router.get("/public/businesses", async (req, res) => {
  try {
    const { country, technology, organisation_type, nature_of_business, partnership_interest } = req.query;
    let query = "SELECT * FROM wri_businesses WHERE is_approved = true";
    const params = [];
    let paramIndex = 1;
    
    if (country) {
      query += ` AND country = $${paramIndex++}`;
      params.push(country);
    }
    if (technology) {
      query += ` AND technology = $${paramIndex++}`;
      params.push(technology);
    }
    if (organisation_type) {
      query += ` AND organisation_type = $${paramIndex++}`;
      params.push(organisation_type);
    }
    if (nature_of_business) {
      query += ` AND nature_of_business = $${paramIndex++}`;
      params.push(nature_of_business);
    }
    if (partnership_interest) {
      query += ` AND partnership_interest = $${paramIndex++}`;
      params.push(partnership_interest);
    }
    
    query += " ORDER BY created_at DESC";
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching WRI businesses:", error);
    res.status(500).json({ error: "Failed to fetch businesses" });
  }
});

router.get("/admin/businesses", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM wri_businesses ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching WRI businesses:", error);
    res.status(500).json({ error: "Failed to fetch businesses" });
  }
});

router.post("/admin/businesses", async (req, res) => {
  try {
    const { name, country, technology, organisation_type, nature_of_business, partnership_interest, description, logo_url, website_url, contact_email, contact_phone, is_approved } = req.body;
    
    if (!name || !country || !technology || !organisation_type || !nature_of_business || !partnership_interest) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    const result = await pool.query(
      `INSERT INTO wri_businesses 
       (name, country, technology, organisation_type, nature_of_business, partnership_interest, description, logo_url, website_url, contact_email, contact_phone, is_approved)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [name, country, technology, organisation_type, nature_of_business, partnership_interest, description || "", logo_url || "", website_url || "", contact_email || "", contact_phone || "", is_approved !== undefined ? is_approved : false]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating WRI business:", error);
    res.status(500).json({ error: "Failed to create business" });
  }
});

router.put("/admin/businesses/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, country, technology, organisation_type, nature_of_business, partnership_interest, description, logo_url, website_url, contact_email, contact_phone, is_approved } = req.body;
    
    const result = await pool.query(
      `UPDATE wri_businesses 
       SET name = $1, country = $2, technology = $3, organisation_type = $4, nature_of_business = $5, partnership_interest = $6, 
           description = $7, logo_url = $8, website_url = $9, contact_email = $10, contact_phone = $11, is_approved = $12, updated_at = CURRENT_TIMESTAMP
       WHERE id = $13 RETURNING *`,
      [name, country, technology, organisation_type, nature_of_business, partnership_interest, description || "", logo_url || "", website_url || "", contact_email || "", contact_phone || "", is_approved !== undefined ? is_approved : false, id]
    );
    
    if (!result.rowCount) {
      return res.status(404).json({ error: "Business not found" });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating WRI business:", error);
    res.status(500).json({ error: "Failed to update business" });
  }
});

router.delete("/admin/businesses/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM wri_businesses WHERE id = $1", [id]);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting WRI business:", error);
    res.status(500).json({ error: "Failed to delete business" });
  }
});

router.get("/public/events", async (req, res) => {
  try {
    const { status } = req.query;
    let query = "SELECT * FROM wri_events";
    const params = [];
    
    if (status) {
      query += " WHERE status = $1";
      params.push(status);
    }
    
    query += " ORDER BY event_date ASC";
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching WRI events:", error);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

router.get("/admin/events", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM wri_events ORDER BY event_date DESC");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching WRI events:", error);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

router.post("/admin/events", async (req, res) => {
  try {
    const { title, event_date, location, description, image_url, registration_link, status } = req.body;
    
    if (!title || !event_date || !location) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    const result = await pool.query(
      `INSERT INTO wri_events (title, event_date, location, description, image_url, registration_link, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [title, event_date, location, description || "", image_url || "", registration_link || "", status || "upcoming"]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating WRI event:", error);
    res.status(500).json({ error: "Failed to create event" });
  }
});

router.put("/admin/events/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, event_date, location, description, image_url, registration_link, status } = req.body;
    
    const result = await pool.query(
      `UPDATE wri_events 
       SET title = $1, event_date = $2, location = $3, description = $4, image_url = $5, registration_link = $6, status = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 RETURNING *`,
      [title, event_date, location, description || "", image_url || "", registration_link || "", status || "upcoming", id]
    );
    
    if (!result.rowCount) {
      return res.status(404).json({ error: "Event not found" });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating WRI event:", error);
    res.status(500).json({ error: "Failed to update event" });
  }
});

router.delete("/admin/events/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM wri_events WHERE id = $1", [id]);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting WRI event:", error);
    res.status(500).json({ error: "Failed to delete event" });
  }
});

router.get("/public/partners", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM wri_partners WHERE is_approved = true ORDER BY display_order ASC");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching WRI partners:", error);
    res.status(500).json({ error: "Failed to fetch partners" });
  }
});

router.get("/admin/partners", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM wri_partners ORDER BY display_order ASC");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching WRI partners:", error);
    res.status(500).json({ error: "Failed to fetch partners" });
  }
});

router.post("/admin/partners", async (req, res) => {
  try {
    const { name, logo_url, website_url, description, is_approved, display_order } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    const result = await pool.query(
      `INSERT INTO wri_partners (name, logo_url, website_url, description, is_approved, display_order)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, logo_url || "", website_url || "", description || "", is_approved !== undefined ? is_approved : false, display_order || 0]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating WRI partner:", error);
    res.status(500).json({ error: "Failed to create partner" });
  }
});

router.put("/admin/partners/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, logo_url, website_url, description, is_approved, display_order } = req.body;
    
    const result = await pool.query(
      `UPDATE wri_partners 
       SET name = $1, logo_url = $2, website_url = $3, description = $4, is_approved = $5, display_order = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 RETURNING *`,
      [name, logo_url || "", website_url || "", description || "", is_approved !== undefined ? is_approved : false, display_order || 0, id]
    );
    
    if (!result.rowCount) {
      return res.status(404).json({ error: "Partner not found" });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating WRI partner:", error);
    res.status(500).json({ error: "Failed to update partner" });
  }
});

router.delete("/admin/partners/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM wri_partners WHERE id = $1", [id]);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting WRI partner:", error);
    res.status(500).json({ error: "Failed to delete partner" });
  }
});

router.get("/public/resources", async (req, res) => {
  try {
    const { resource_type } = req.query;
    let query = "SELECT * FROM wri_resources WHERE is_published = true";
    const params = [];
    
    if (resource_type) {
      query += " AND resource_type = $1";
      params.push(resource_type);
    }
    
    query += " ORDER BY created_at DESC";
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching WRI resources:", error);
    res.status(500).json({ error: "Failed to fetch resources" });
  }
});

router.get("/admin/resources", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM wri_resources ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching WRI resources:", error);
    res.status(500).json({ error: "Failed to fetch resources" });
  }
});

router.post("/admin/resources", async (req, res) => {
  try {
    const { title, resource_type, description, file_url, file_name, file_size, external_url, is_published } = req.body;
    
    if (!title || !resource_type) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    const result = await pool.query(
      `INSERT INTO wri_resources (title, resource_type, description, file_url, file_name, file_size, external_url, is_published)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [title, resource_type, description || "", file_url || "", file_name || "", 0, external_url || "", is_published !== undefined ? is_published : true]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating WRI resource:", error);
    res.status(500).json({ error: "Failed to create resource" });
  }
});

router.put("/admin/resources/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, resource_type, description, file_url, file_name, file_size, external_url, is_published } = req.body;
    
    const result = await pool.query(
      `UPDATE wri_resources 
       SET title = $1, resource_type = $2, description = $3, file_url = $4, file_name = $5, file_size = $6, external_url = $7, is_published = $8, updated_at = CURRENT_TIMESTAMP
       WHERE id = $9 RETURNING *`,
      [title, resource_type, description || "", file_url || "", file_name || "", 0, external_url || "", is_published !== undefined ? is_published : true, id]
    );
    
    if (!result.rowCount) {
      return res.status(404).json({ error: "Resource not found" });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating WRI resource:", error);
    res.status(500).json({ error: "Failed to update resource" });
  }
});

router.delete("/admin/resources/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM wri_resources WHERE id = $1", [id]);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting WRI resource:", error);
    res.status(500).json({ error: "Failed to delete resource" });
  }
});

export default router;
