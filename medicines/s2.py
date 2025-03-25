import time
import pandas as pd
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

# ✅ Set up Selenium WebDriver
chrome_options = Options()
chrome_options.add_argument("--headless")  # ❌ Remove if debugging
chrome_options.add_argument("--disable-gpu")
chrome_options.add_argument("--no-sandbox")

service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service, options=chrome_options)

# ✅ Category URL to scrape
category_url = "https://pharmeasy.in/health-care/717"
driver.get(category_url)

# ✅ Scroll & Load All Products Dynamically
def load_all_products():
    """Scrolls slowly and interacts with page to ensure all products load."""
    last_height = driver.execute_script("return document.body.scrollHeight")

    while True:
        # 🔹 Scroll in small steps (triggers lazy loading)
        for _ in range(5):  
            driver.execute_script("window.scrollBy(0, 500);")
            time.sleep(1)

        # ✅ Check for a "Load More" button and click it
        try:
            load_more_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Load More')]")
            load_more_button.click()
            print("🔹 Clicked 'Load More' button")
            time.sleep(3)  # ✅ Allow more products to load
        except:
            pass  # If no button, continue scrolling

        # ✅ Wait for new products to load
        try:
            WebDriverWait(driver, 5).until(
                EC.presence_of_element_located((By.XPATH, "//a[contains(@class, 'ProductCard_displayBlock__')]"))
            )
        except:
            pass  # If timeout, continue

        # ✅ Count loaded products
        product_elements = driver.find_elements(By.XPATH, "//a[contains(@class, 'ProductCard_displayBlock__')]")
        product_count = len(product_elements)
        print(f"🔹 Loaded {product_count} products so far...")

        # ✅ Check if no new products are loading
        new_height = driver.execute_script("return document.body.scrollHeight")
        if new_height == last_height:
            print("✅ All products loaded.")
            break
        last_height = new_height

load_all_products()  # ✅ Load all available products

# ✅ Extract product URLs
time.sleep(2)  # Ensure everything is fully loaded
product_elements = driver.find_elements(By.XPATH, "//a[contains(@class, 'ProductCard_displayBlock__')]")
product_urls = list(set([p.get_attribute("href") for p in product_elements if p.get_attribute("href")]))  # ✅ Remove duplicates

print(f"🔹 Found {len(product_urls)} products. Scraping details now...")

# ✅ Extract full details from each product page
data_list = []
for index, url in enumerate(product_urls):
    driver.get(url)
    time.sleep(2)  # ✅ Allow product page to load

    try:
        name = driver.find_element(By.XPATH, "//h1").text.strip()
    except:
        name = "N/A"

    try:
        price = driver.find_element(By.XPATH, "//span[contains(@class, 'ProductPriceContainer_striked__')]").text.strip()
    except:
        price = "N/A"

    try:
        image_url = driver.find_element(By.XPATH, "//img[contains(@class, 'ProductImageCarousel_productImage__')]").get_attribute("src")
    except:
        image_url = "N/A"

    data_list.append({"Name": name, "Price": price, "Image URL": image_url})
    print(f"✅ {index+1}/{len(product_urls)} Scraped: {name} - {price}")

# ✅ Save data to CSV
df = pd.DataFrame(data_list)
df.to_csv("Health_Monitor.csv", index=False)

print("✅ Scraping completed! Data saved to Health_Monitor.csv")
driver.quit()
