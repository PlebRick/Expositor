// File: src/fs-access.d.ts
// Page Title: DOM augmentation — File-System Access API helpers

// Only add the members if they’re missing
declare global {
  interface FileSystemHandlePermissionDescriptor {
    mode?: 'read' | 'readwrite';
  }

  interface FileSystemHandle {
    queryPermission(
      descriptor?: FileSystemHandlePermissionDescriptor,
    ): Promise<PermissionState>;
    requestPermission(
      descriptor?: FileSystemHandlePermissionDescriptor,
    ): Promise<PermissionState>;
  }

  // Directory & File handles inherit from FileSystemHandle,
  // so no extra declarations are needed if they already exist.
}

export {};
