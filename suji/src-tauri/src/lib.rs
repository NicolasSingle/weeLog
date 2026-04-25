use tauri::{
    menu::{Menu, MenuItem},
    tray::{TrayIconBuilder, TrayIconEvent},
    Manager,
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let show_main = MenuItem::with_id(app, "show_main", "显示主窗口", true, None::<&str>)?;
            let show_float = MenuItem::with_id(app, "show_float", "显示悬浮窗口", true, None::<&str>)?;
            let quit = MenuItem::with_id(app, "quit", "退出", true, None::<&str>)?;

            let menu = Menu::with_items(app, &[&show_main, &show_float, &quit])?;

            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .show_menu_on_left_click(false)
                .on_menu_event(|app, event| {
                    match event.id.as_ref() {
                        "show_main" => {
                            // Hide float window when showing main window
                            if let Some(float) = app.get_webview_window("float") {
                                float.hide().ok();
                            }
                            if let Some(w) = app.get_webview_window("main") {
                                w.show().ok();
                                w.set_focus().ok();
                            }
                        }
                        "show_float" => {
                            if let Some(w) = app.get_webview_window("float") {
                                w.show().ok();
                                w.set_focus().ok();
                            }
                        }
                        "quit" => {
                            app.exit(0);
                        }
                        _ => {}
                    }
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click { button, .. } = event {
                        if button == tauri::tray::MouseButton::Left {
                            let app = tray.app_handle();
                            if let Some(w) = app.get_webview_window("float") {
                                w.show().ok();
                                w.set_focus().ok();
                            }
                        }
                    }
                })
                .build(app)?;

            if let Some(float) = app.get_webview_window("float") {
                float.set_focus().ok();
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
