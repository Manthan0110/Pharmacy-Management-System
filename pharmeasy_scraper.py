import os
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

service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service, options=chrome_options)

# List of medicine URLs to scrape
urls = [
    "https://pharmeasy.in/online-medicine-order/a-to-z-woman-cap-15-s-174701",
]

data_list = []

for url in urls:
    driver.get(url)
    time.sleep(5)  # Allow page to load

    # Wait until the product detail section is available
    wait = WebDriverWait(driver, 30)
    wait.until(EC.presence_of_element_located((By.XPATH, "//div[contains(@class, 'PDPDesktop_infoContainer__oJbvI')]")))

    # Extract product details
    try:
        name = driver.find_element(By.XPATH, "//h1").text
    except:
        name = "N/A"

    try:
        price = driver.find_element(By.XPATH, "//span[contains(@class, 'PriceInfo_striked')]").text
    except:
        price = "N/A"

    try:
        image_url = driver.find_element(By.XPATH, "//img[contains(@class, 'ProductImageCarousel_productImage__wIcH6')]").get_attribute("src")
    except:
        image_url = "N/A"


    # Store data in list
    data_list.append({"Name": name, "Price": price, "Image URL": image_url})

# Close the browser
driver.quit()

# Define CSV file path
csv_file = "pharmeasy_product.csv"

# Check if file exists to manage headers correctly
file_exists = os.path.exists(csv_file)

# Save data to CSV (Append Mode)
df = pd.DataFrame(data_list)
df.to_csv(csv_file, mode='a', header=not file_exists, index=False)

print("✅ Scraping completed! Data added to pharmeasy_product.csv")
