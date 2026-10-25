#import <AppKit/AppKit.h>

static NSWindow *gpuix_window(void) {
    return NSApp.windows.count ? NSApp.windows.firstObject : nil;
}

// Ensure the content view covers the titlebar band.
void gpuix_chrome_init(void) {
    NSWindow *w = gpuix_window();
    if (!w) return;
    w.styleMask |= NSWindowStyleMaskFullSizeContentView;
    w.titlebarAppearsTransparent = YES;
    w.titleVisibility = NSWindowTitleHidden;
}

// Called from mousedown while AppKit is still handling that event.
void gpuix_window_drag(void) {
    NSWindow *w = gpuix_window();
    NSEvent *e = NSApp.currentEvent;
    if (w && e) [w performWindowDragWithEvent:e];
}
