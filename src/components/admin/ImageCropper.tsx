import { useState, useRef, useCallback } from "react";
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Crop as CropIcon, Loader2 } from "lucide-react";

const ASPECT_PRESETS = [
  { label: "Free", value: "free", ratio: undefined },
  { label: "16:9", value: "16:9", ratio: 16 / 9 },
  { label: "4:3", value: "4:3", ratio: 4 / 3 },
  { label: "1:1", value: "1:1", ratio: 1 },
  { label: "3:2", value: "3:2", ratio: 3 / 2 },
  { label: "2:1", value: "2:1", ratio: 2 / 1 },
];

interface ImageCropperProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  onCropComplete: (croppedDataUrl: string) => void;
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number): Crop {
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 80 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight
  );
}

export function ImageCropper({ open, onOpenChange, imageUrl, onCropComplete }: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [preset, setPreset] = useState("16:9");
  const [saving, setSaving] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const currentRatio = ASPECT_PRESETS.find(p => p.value === preset)?.ratio;

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    const ratio = currentRatio ?? 16 / 9;
    setCrop(centerAspectCrop(naturalWidth, naturalHeight, ratio));
  }, [currentRatio]);

  function handlePresetChange(value: string) {
    if (!value) return;
    setPreset(value);
    const ratio = ASPECT_PRESETS.find(p => p.value === value)?.ratio;
    if (imgRef.current && ratio) {
      const { naturalWidth, naturalHeight } = imgRef.current;
      setCrop(centerAspectCrop(naturalWidth, naturalHeight, ratio));
    }
  }

  async function handleApply() {
    if (!completedCrop || !imgRef.current) return;
    setSaving(true);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const img = imgRef.current;

    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;

    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;

    ctx.drawImage(
      img,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0, 0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob((blob) => {
      if (!blob) { setSaving(false); return; }
      const reader = new FileReader();
      reader.onloadend = () => {
        onCropComplete(reader.result as string);
        setSaving(false);
        onOpenChange(false);
      };
      reader.readAsDataURL(blob);
    }, "image/webp", 0.9);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CropIcon className="h-5 w-5" /> Crop Image
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <ToggleGroup type="single" value={preset} onValueChange={handlePresetChange} className="justify-start">
            {ASPECT_PRESETS.map(p => (
              <ToggleGroupItem key={p.value} value={p.value} size="sm" className="text-xs px-2.5">
                {p.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          <div className="flex justify-center bg-muted/30 rounded-lg p-2 max-h-[60vh] overflow-auto">
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={currentRatio}
            >
              <img
                ref={imgRef}
                src={imageUrl}
                alt="Crop preview"
                onLoad={onImageLoad}
                className="max-h-[55vh] object-contain"
                crossOrigin="anonymous"
              />
            </ReactCrop>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleApply} disabled={!completedCrop || saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CropIcon className="h-4 w-4" />}
            Apply Crop
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
