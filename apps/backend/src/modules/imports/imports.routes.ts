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

// Template download — không cần auth (public)
router.get(
  "/farm-zones/template",
  asyncHandler(ImportsController.downloadTemplate),
);

router.get(
  "/crops/template",
  asyncHandler(ImportsController.downloadCropsTemplate),
);

router.get(
  "/sensors/template",
  asyncHandler(ImportsController.downloadSensorsTemplate),
);

router.use(authenticate);

router.post(
  "/farm-zones",
  upload.single("file"),
  asyncHandler(ImportsController.importFarmZones),
);

router.post(
  "/crops",
  upload.single("file"),
  asyncHandler(ImportsController.importCrops),
);

router.post(
  "/sensors",
  upload.single("file"),
  asyncHandler(ImportsController.importSensors),
);

export default router;

