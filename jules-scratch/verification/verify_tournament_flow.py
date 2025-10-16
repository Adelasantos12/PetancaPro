import json
from playwright.sync_api import sync_playwright, Page, expect

def create_dummy_teams(num_teams=58):
    """Generates a list of dummy teams."""
    teams = []
    for i in range(1, num_teams + 1):
        teams.append({
            "id": f"team-{i}",
            "name": f"Equipo {i}",
            "captain": f"Capitán {i}",
            "player2": f"Jugador {i}B",
            "attended": True
        })
    return teams

def run_verification(page: Page):
    """Main verification function."""
    page.goto("http://localhost:3000/register")

    # 1. Inject 58 teams into localStorage
    teams_data = create_dummy_teams(58)
    page.evaluate(f"window.localStorage.setItem('petancapro-teams', '{json.dumps(teams_data)}')")
    page.evaluate("window.localStorage.setItem('petanca-teams', '[]')")
    page.evaluate("window.localStorage.setItem('petanca-round', '0')")
    page.evaluate("window.localStorage.setItem('petanca-matches', '[]')")
    page.evaluate("window.localStorage.setItem('petanca-show-ranking', 'false')")
    # The value for 'petanca-phase' must be a JSON-stringified string.
    page.evaluate("window.localStorage.setItem('petanca-phase', '\"swiss\"')")
    page.evaluate("window.localStorage.setItem('petanca-match-history', '[]')")


    # 2. Navigate to tournament page
    page.goto("http://localhost:3000/tournament")
    expect(page.get_by_text("58 equipos han confirmado asistencia.")).to_be_visible()

    # 3. Play rounds 1 to 5
    for i in range(1, 6):
        # Generate round
        if i == 1:
            page.get_by_role("button", name="Generar Primera Ronda").click()
        else:
            page.get_by_role("button", name=f"Generar Ronda {i}").click()

        expect(page.get_by_text(f"Ronda {i}")).to_be_visible()

        # Play all matches in the round
        # Play all matches in the round by repeatedly finding the first available match
        while page.get_by_role("button", name="Registrar").count() > 0:
            match_div = page.locator("div.bg-white.rounded-xl.shadow-md").filter(
                has=page.get_by_role("button", name="Registrar")
            ).first

            # Enter scores
            match_div.locator('input[type="number"]').first.fill("13")
            match_div.locator('input[type="number"]').last.fill("0")

            # Click the "Registrar" button within that specific match div
            match_div.get_by_role("button", name="Registrar").click()

            # Wait for the "Ganador" text to appear within that same div
            expect(match_div.get_by_text("Ganador:")).to_be_visible(timeout=15000)

    # 4. Assign categories after round 5
    expect(page.get_by_role("button", name="Finalizar Día 1 y Asignar Categorías")).to_be_visible()
    page.get_by_role("button", name="Finalizar Día 1 y Asignar Categorías").click()
    expect(page.get_by_text("¡Listo para el Día 2!")).to_be_visible()

    # 5. Start Round 6 (Reclassification)
    page.get_by_role("button", name="Iniciar Ronda 6").click()
    expect(page.get_by_text("Ronda 6 - Reclasificación")).to_be_visible()

    # 6. Play all reclassification matches
    while True:
        registrar_buttons = page.get_by_role("button", name="Registrar").all()
        if not registrar_buttons:
            break

        match_div = page.locator(".bg-white.rounded-xl.shadow-md").filter(has=registrar_buttons[0]).first

        match_div.locator('input[type="number"]').first.fill("13")
        match_div.locator('input[type="number"]').last.fill("0")

        registrar_buttons[0].click()
        expect(match_div.get_by_text("Ganador:")).to_be_visible(timeout=10000)

    # 7. Finalize and generate final round
    expect(page.get_by_role("button", name="Finalizar Reclasificación y Generar Ronda Final")).to_be_visible()
    page.get_by_role("button", name="Finalizar Reclasificación y Generar Ronda Final").click()

    # 8. Verify the final state
    expect(page.get_by_text("Ronda Final (Ronda 7)")).to_be_visible()

    # Show ranking to take screenshot
    page.get_by_role("button", name="Mostrar Ranking").click()

    # Check for correct categories
    expect(page.get_by_text("A", exact=True).first).to_be_visible()
    expect(page.get_by_text("AA", exact=True).first).to_be_visible()
    expect(page.get_by_text("B", exact=True).first).to_be_visible()
    expect(page.get_by_text("BB", exact=True).first).to_be_visible()
    expect(page.get_by_text("C", exact=True).first).to_be_visible()
    expect(page.get_by_text("CC", exact=True).first).to_be_visible()
    expect(page.get_by_text("Eliminado").first).to_be_visible()

    # Take screenshot
    page.screenshot(path="jules-scratch/verification/verification.png", full_page=True)


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            run_verification(page)
            print("Verification script completed successfully.")
        except Exception as e:
            print(f"An error occurred: {e}")
            page.screenshot(path="jules-scratch/verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    main()