import { Router } from "express";
import multer from "multer";
import { authenticate, authorize } from "../../middlewares/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { ImportsController } from "./imports.controller";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    const name = file.originalname.toLowerCase();

    if (
      name.endsWith(".xlsx") ||
      name.endsWith(".csv") ||
      name.endsWith(".txt")
    ) {
      cb(null, true);
      return;
    }

    cb(new Error("Chỉ hỗ trợ file .xlsx, .csv hoặc .txt"));
  },
});

router.use(authenticate);

router.post(
  "/farm-zones",
  authorize(["ADMIN"]),
  upload.single("file"),
  asyncHandler(ImportsController.importFarmZones),
);

export default router;
