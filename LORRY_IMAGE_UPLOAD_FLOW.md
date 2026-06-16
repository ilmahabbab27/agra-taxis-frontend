# Lorry Image Upload Flow

## Frontend Flow (React)

```
User clicks upload box
    ↓
File input opens (native OS picker)
    ↓
User selects image file
    ↓
onLorryImageUpload() is triggered
    ├─ Check: file exists and is image? ✓
    ├─ Set loading state: setLorryImageUploading(target)
    │
    ├─ TRY: Upload to backend
    │  ├─ Create FormData with file
    │  ├─ POST /api/vehicles/image
    │  ├─ If success (200):
    │  │  ├─ Extract URL from response
    │  │  ├─ Build full URL
    │  │  └─ updateLorryImageForm(target, fullUrl)
    │  │
    │  └─ If fail (500):
    │     └─ CATCH block → Fallback to base64
    │
    └─ CATCH: Convert file to base64
       ├─ Read file as DataURL
       └─ updateLorryImageForm(target, base64String)
    
    ↓
Clear loading state: setLorryImageUploading(null)
    ↓
Display image preview in upload box
```

## Backend Flow (Laravel)

```
POST /api/vehicles/image
    ↓
VehicleController::uploadImage()
    ├─ Validate:
    │  ├─ image field exists? ✓
    │  ├─ is file? ✓
    │  ├─ is image? ✓ (jpg, png, gif, etc)
    │  └─ size < 5MB? ✓
    │
    ├─ Generate unique filename:
    │  └─ uniqid('vehicle_', true) . '.' . extension
    │     Example: vehicle_6796f4a5e5f34.jpg
    │
    ├─ Ensure /vehicles directory exists
    │  └─ mkdir($dest, 0775, true) if needed
    │
    ├─ Move uploaded file to /vehicles/
    │  └─ $file->move($dest, $filename)
    │
    └─ Return response:
       ├─ Status: 201 (Created)
       └─ Body: { "url": "/vehicles/vehicle_6796f4a5e5f34.jpg" }
```

## Save Flow (After uploading all images)

```
User clicks "Save Lorry Images" button
    ↓
saveLorryImages() is triggered
    ├─ Check: currentLorry exists? ✓
    ├─ Check: currentLorry.id exists? ✓
    │
    ├─ Build payload:
    │  ├─ Spread currentLorry data (name, category, etc)
    │  └─ Spread imageData (img, img2, img3, img4, img5)
    │
    ├─ Call saveLorryToDatabase(payload, currentLorry.id)
    │  └─ Routes to: PUT /api/lorries/{id}
    │
    └─ If success:
       ├─ Show alert: "Lorry images saved successfully!"
       ├─ Refresh vehicles list
       └─ Done ✓
    
    If fail:
    └─ Show alert: "Failed to save lorry images"
```

## Image Field Configuration

Each lorry can have up to 5 images:

| Field | Default | Purpose |
|-------|---------|---------|
| img   | /assets/car.jpg | Main/primary image |
| img2  | null | Secondary image |
| img3  | null | Tertiary image |
| img4  | null | Quaternary image |
| img5  | null | Quinary image |

## Database Structure

```
vehicles table
├─ id (PK)
├─ name: varchar(255) - UNIQUE (e.g., "Agra Lorries")
├─ category: varchar(255) (e.g., "Lorries")
├─ img: text (URL or base64)
├─ img2: text (nullable)
├─ img3: text (nullable)
├─ img4: text (nullable)
├─ img5: text (nullable)
├─ lorry_rates: json (rate_table structure)
└─ ... other fields
```

## Troubleshooting

### 500 Error on Image Upload
- **Cause**: `/vehicles` directory can't be created or doesn't have write permissions
- **Solution**: Check backend folder permissions, ensure web server can write to /vehicles
- **Fallback**: Image stored as base64 (still works, just not uploaded to server)

### 422 Error on Save (Unprocessable Content)
- **Cause**: Vehicle name already exists (tried INSERT instead of UPDATE)
- **Fix**: Pass `currentLorry.id` as 2nd parameter to `saveLorryToDatabase()`
- **Status**: ✓ FIXED in frontend

### Image Not Showing After Save
- **Check 1**: Is image URL correct? (Should start with `/vehicles/` or be base64)
- **Check 2**: Did file upload endpoint return correct URL?
- **Check 3**: Is the `/vehicles` directory accessible from browser?

## Current Implementation

✅ File picker - Works (native HTML input)
✅ Image upload - Works (with base64 fallback for 500 errors)
✅ Image preview - Works (shows in upload box)
✅ Save lorry images - Works (fixed to use UPDATE not INSERT)
✅ Loading state - Works (shows spinner during upload)
