---
name: rest-api-crud
description: RESTful CRUD API with Express and TypeScript
framework: express
features: [api, crud, typescript]
---

# REST API CRUD Template

## Controller Template

```typescript
import { Request, Response } from 'express';
import { {{ModelName}} } from '../models/{{ModelName}}';
import { validate{{ModelName}} } from '../validators/{{modelName}}Validator';

export class {{ModelName}}Controller {
  async getAll(req: Request, res: Response) {
    try {
      const items = await {{ModelName}}.find()
        .limit(req.query.limit || 100)
        .skip(req.query.skip || 0);
      
      res.json({
        success: true,
        data: items,
        count: items.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const item = await {{ModelName}}.findById(req.params.id);
      
      if (!item) {
        return res.status(404).json({
          success: false,
          error: '{{ModelName}} not found'
        });
      }
      
      res.json({
        success: true,
        data: item
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const validation = validate{{ModelName}}(req.body);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          errors: validation.errors
        });
      }

      const item = new {{ModelName}}(req.body);
      await item.save();
      
      res.status(201).json({
        success: true,
        data: item
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const item = await {{ModelName}}.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      
      if (!item) {
        return res.status(404).json({
          success: false,
          error: '{{ModelName}} not found'
        });
      }
      
      res.json({
        success: true,
        data: item
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const item = await {{ModelName}}.findByIdAndDelete(req.params.id);
      
      if (!item) {
        return res.status(404).json({
          success: false,
          error: '{{ModelName}} not found'
        });
      }
      
      res.json({
        success: true,
        message: '{{ModelName}} deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}
```

## Route Template

```typescript
import { Router } from 'express';
import { {{ModelName}}Controller } from '../controllers/{{modelName}}Controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const controller = new {{ModelName}}Controller();

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', authenticate, controller.create);
router.put('/:id', authenticate, controller.update);
router.delete('/:id', authenticate, controller.delete);

export default router;
```

## Variables

- `{{ModelName}}`: PascalCase model name (e.g., User, Product)
- `{{modelName}}`: camelCase model name (e.g., user, product)