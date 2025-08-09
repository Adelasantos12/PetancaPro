import re
from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Start the dev server before running this script
    page.goto("http://localhost:3000/")

    # Go to registration
    page.get_by_role("link", name="Registrar Equipos").click()
    expect(page).to_have_url("http://localhost:3000/register")

    # Register 4 teams
    for i in range(1, 5):
        page.get_by_placeholder("Nombre del Equipo").fill(f"Team {i}")
        page.get_by_placeholder("Nombre del Capitán").fill(f"Captain {i}")
        page.get_by_role("button", name="Agregar Equipo").click()

    # Go to tournament
    page.get_by_role("link", name="Ir al Torneo").click()
    expect(page).to_have_url("http://localhost:3000/tournament")

    # Start tournament
    page.get_by_role("button", name="Generar Primera Ronda").click()
    expect(page.get_by_role("heading", name="Ronda 1")).to_be_visible()

    # Generate round 2
    # To do this, we need to fill in scores for round 1
    matches = page.locator(".bg-white.rounded-xl.shadow-md").all()
    for match in matches:
        match.locator('input[type="number"]').nth(0).fill("13")
        match.locator('input[type="number"]').nth(1).fill("0")
        match.locator('button:has-text("Registrar")').click()

    page.get_by_role("button", name="Generar Ronda 2").click()
    expect(page.get_by_role("heading", name="Ronda 2")).to_be_visible()

    # Go back to round 1
    page.get_by_role("button").first.click() # This is the back button

    # Assert we are back in round 1
    expect(page.get_by_role("heading", name="Ronda 1")).to_be_visible()

    page.screenshot(path="jules-scratch/verification/verification.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
