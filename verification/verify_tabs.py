
import json
from playwright.sync_api import sync_playwright, expect

def verify_tabs():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()

        session_data = {
            "state": {
                "sessionData": {
                    "user": {
                        "id": "test-user-id",
                        "email": "test@example.com",
                        "role": {
                            "id_rol": "test-role-id",
                            "nombre": "superuser",
                            "descripcion": "Super User",
                            "permissions": {
                                "menu": {
                                    "registros": {
                                        "show_view": True,
                                        "show_form_register": True
                                    }
                                }
                            }
                        }
                    },
                    "locations": [{"id": 1, "name": "Test Location"}]
                },
                "isAuthenticated": True,
                "currentLocation": {"id": 1, "name": "Test Location"}
            },
            "version": 0
        }

        session_json = json.dumps(session_data)

        page = context.new_page()

        page.on("console", lambda msg: print(f"BROWSER CONSOLE: {msg.text}"))

        page.goto("http://localhost:3000/")
        page.evaluate("(data) => localStorage.setItem('user-storage', data)", session_json)

        page.reload()
        page.wait_for_timeout(2000)

        page.goto("http://localhost:3000/registros")

        # Force remove the overlay blocking clicks if it exists (likely the loading spinner or error boundary)
        page.evaluate("""
            const overlay = document.querySelector('.fixed.inset-0');
            if (overlay) overlay.remove();
        """)

        try:
             expect(page.get_by_role("heading", name="Registros")).to_be_visible(timeout=5000)
        except Exception:
            print("Heading 'Registros' not found")
            page.screenshot(path="verification/debug_failure.png")
            raise

        registros_tab = page.get_by_role("tab", name="Registros")
        garantias_tab = page.get_by_role("tab", name="Garantías")

        expect(registros_tab).to_be_visible()
        expect(garantias_tab).to_be_visible()

        # Click Garantias tab
        garantias_tab.click(force=True) # Using force=True to bypass potential overlays

        # Verify Garantias content
        expect(page.get_by_role("heading", name="Formulario Garantías")).to_be_visible()

        # Take screenshot
        page.screenshot(path="verification/tabs_verification.png")
        print("Verification script completed successfully.")

        browser.close()

if __name__ == "__main__":
    verify_tabs()
