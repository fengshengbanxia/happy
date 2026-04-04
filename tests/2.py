from playwright.sync_api import sync_playwright

def test_browser():
    with sync_playwright() as p:
        # 启动浏览器
        browser = p.chromium.launch(headless=False)  # headless=False 会显示浏览器窗口
        page = browser.new_page()
        
        # 访问网页
        page.goto("https://www.baidu.com")
        
        # 获取网页标题
        title = page.title()
        print(f"网页标题: {title}")
        
        # 截图
        page.screenshot(path="test_screenshot.png")
        print("截图已保存为 test_screenshot.png")
        
        # 关闭浏览器
        browser.close()

if __name__ == "__main__":
    test_browser()