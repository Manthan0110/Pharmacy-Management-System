import time
import pandas as pd
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

# Set up Selenium WebDriver
chrome_options = Options()
chrome_options.add_argument("--disable-gpu")
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("--headless")  # Run headless for speed (remove for debugging)

service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service, options=chrome_options)

# Base URL for browsing all medicines
base_url = "https://pharmeasy.in/online-medicine-order/browse"
driver.get(base_url)
time.sleep(5)  # Allow page to load

# Extract all alphabet filter links
alphabet_links = {}
alphabets = driver.find_elements(By.XPATH, "//a[starts-with(@href, '/online-medicine-order/browse?alph')]")

for alphabet in alphabets:
    letter = alphabet.text.strip().upper()  # Extract the letter (A, B, C, ...)
    if letter and letter <= "N":  # Only store links up to 'N'
        alphabet_links[letter] = alphabet.get_attribute("href")

print(f"✅ Found {len(alphabet_links)} alphabet links up to 'N': {list(alphabet_links.keys())}")

# Initialize the list for storing medicine data
medicine_list = []

# Loop through each alphabet's page (only A to N)
for letter, alphabet_url in sorted(alphabet_links.items()):
    driver.get(alphabet_url)  # Visit the alphabet page
    time.sleep(3)

    print(f"🔤 Scraping medicines under {letter}...")

    # Extract all medicine links for that alphabet
    medicine_links = []
    medicines = driver.find_elements(By.XPATH, "//a[contains(@href, '/online-medicine-order/')]")

    for medicine in medicines:
        link = medicine.get_attribute("href")
        if link and "browse" not in link:  # Avoid non-product links
            medicine_links.append(link)

    print(f"  📌 Found {len(medicine_links)} medicines under {letter}.")

    # Scrape each medicine's details
    for idx, medicine_url in enumerate(medicine_links):
        driver.get(medicine_url)  # Visit the medicine page
        time.sleep(3)

        try:
            name = driver.find_element(By.XPATH, "//h1").text
        except:
            name = "N/A"

        try:
            price = driver.find_element(By.XPATH, "//span[contains(@class, 'PriceInfo_striked')]").text
        except:
            price = "N/A"

        try:
            image_url = driver.find_element(By.XPATH, "//img[contains(@class, 'ProductImageCarousel')]").get_attribute("src")
        except:
            image_url = "N/A"

        # Append extracted data
        medicine_list.append({"Name": name, "Price": price, "Image URL": image_url})

        print(f"    ✅ Scraped {idx + 1}/{len(medicine_links)}: {name}")

# Close the browser
driver.quit()

# Save data to CSV (Append Mode)
df = pd.DataFrame(medicine_list)
df.to_csv("pharmeasy_medicines.csv", mode="a", header=False, index=False)

print("✅ Scraping completed! Data saved to pharmeasy_medicines.csv")
