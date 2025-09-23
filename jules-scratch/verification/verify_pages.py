from playwright.sync_api import sync_playwright, expect

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1920, 'height': 1080})

        # Navigate to the home page
        page.goto("http://localhost:3000")

        # Wait for the main heading to be visible
        expect(page.get_by_role("heading", name="Bienvenido a PetancaPro")).to_be_visible()

        # Take a screenshot of the home page
        page.screenshot(path="jules-scratch/verification/home.png", full_page=True)

        # Click the link to the academic profile
        profile_link = page.get_by_role("link", name="View academic profile")
        profile_link.click()

        # Wait for the profile page to load by checking for the main heading
        expect(page.get_by_role("heading", name="Adela Beatriz Santos Domínguez")).to_be_visible()

        # Take a screenshot of the profile page
        page.screenshot(path="jules-scratch/verification/profile.png", full_page=True)

        browser.close()

if __name__ == "__main__":
    run_verification()
