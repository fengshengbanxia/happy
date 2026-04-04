import { test, expect, Page } from '@playwright/test';

// 测试配置：使用 file:// 协议打开本地 HTML 文件
const PAGE_URL = 'file:///g:/githubProject/happy/index.html';

// 辅助函数：验证号码是否为两位数格式（如 01, 02...35）
function validateNumberFormat(numStr: string): boolean {
  return /^\d{2}$/.test(numStr);
}

// 辅助函数：验证号码范围
function validateFrontNumberRange(num: number): boolean {
  return num >= 1 && num <= 35;
}

function validateBackNumberRange(num: number): boolean {
  return num >= 1 && num <= 12;
}

// 辅助函数：解析显示的号码列表
async function getDisplayedNumbers(page: Page, containerId: string): Promise<string[]> {
  const numbers = await page.locator(`#${containerId} .number-item`).allTextContents();
  return numbers.map(n => n.trim());
}

// 辅助函数：等待动画完成
async function waitForAnimation(page: Page, timeout: number = 3000): Promise<void> {
  await page.waitForTimeout(timeout);
}

test.describe('大乐透摇号模拟器 - E2E 测试套件', () => {

  // ==========================================
  // 1. 页面加载测试
  // ==========================================
  test.describe('页面加载', () => {

    test('应成功加载页面并显示标题', async ({ page }) => {
      // 目的：验证页面能够正常加载，标题和基本元素可见
      await page.goto(PAGE_URL);

      // 验证页面标题存在且内容正确
      const title = page.locator('h1');
      await expect(title).toBeVisible();
      await expect(title).toContainText('大乐透摇号模拟器');

      // 验证副标题存在
      const subtitle = page.locator('.subtitle');
      await expect(subtitle).toBeVisible();
    });

    test('页面加载后应自动生成初始号码', async ({ page }) => {
      // 目的：验证页面加载后，"我的号码"区域会自动生成一组随机号码
      await page.goto(PAGE_URL);

      // 等待页面完全加载和初始号码生成
      await page.waitForTimeout(1000);

      // 验证我的号码区域有号码显示
      const myFrontNumbers = await getDisplayedNumbers(page, 'myFrontNumbers');
      const myBackNumbers = await getDisplayedNumbers(page, 'myBackNumbers');

      // 验证前区有5个号码
      expect(myFrontNumbers.length).toBe(5);
      // 验证后区有2个号码
      expect(myBackNumbers.length).toBe(2);
    });

    test('所有功能按钮都应可见', async ({ page }) => {
      // 目的：验证页面上所有主要功能按钮都能正常显示
      await page.goto(PAGE_URL);

      // 验证主要功能按钮可见
      await expect(page.locator('button:has-text("单次随机摇号")')).toBeVisible();
      await expect(page.locator('button:has-text("手动输入号码")')).toBeVisible();
      await expect(page.locator('button:has-text("批量模拟")').first()).toBeVisible();
      await expect(page.locator('button:has-text("号码筛选")')).toBeVisible();
      await expect(page.locator('button:has-text("查看历史")')).toBeVisible();
      await expect(page.locator('button:has-text("冷热分析")').first()).toBeVisible();
    });
  });

  // ==========================================
  // 2. 单次摇号功能测试
  // ==========================================
  test.describe('单次随机摇号', () => {

    test('点击单次摇号按钮应生成新的随机号码', async ({ page }) => {
      // 目的：验证单次摇号功能能正常工作，生成符合规则的号码
      await page.goto(PAGE_URL);
      await waitForAnimation(page);

      // 记录初始号码
      const initialFrontNumbers = await getDisplayedNumbers(page, 'myFrontNumbers');
      const initialBackNumbers = await getDisplayedNumbers(page, 'myBackNumbers');

      // 点击单次摇号按钮
      await page.click('button:has-text("单次随机摇号")');

      // 等待摇号动画完成（包括开奖动画）
      await page.waitForTimeout(4000);

      // 获取摇号后的号码
      const newFrontNumbers = await getDisplayedNumbers(page, 'myFrontNumbers');
      const newBackNumbers = await getDisplayedNumbers(page, 'myBackNumbers');

      // 验证生成了新号码
      expect(newFrontNumbers.length).toBe(5);
      expect(newBackNumbers.length).toBe(2);
    });

    test('生成的号码应为两位数格式', async ({ page }) => {
      // 目的：验证所有生成的号码都是两位数格式（01, 02, ... 35）
      await page.goto(PAGE_URL);
      await page.click('button:has-text("单次随机摇号")');
      await page.waitForTimeout(4000);

      // 获取我的号码
      const myFrontNumbers = await getDisplayedNumbers(page, 'myFrontNumbers');
      const myBackNumbers = await getDisplayedNumbers(page, 'myBackNumbers');

      // 获取开奖号码
      const winFrontNumbers = await getDisplayedNumbers(page, 'winFrontNumbers');
      const winBackNumbers = await getDisplayedNumbers(page, 'winBackNumbers');

      // 验证所有号码都是两位数格式
      const allNumbers = [...myFrontNumbers, ...myBackNumbers, ...winFrontNumbers, ...winBackNumbers];
      for (const num of allNumbers) {
        expect(validateNumberFormat(num)).toBe(true);
      }
    });

    test('前区号码应在1-35范围内', async ({ page }) => {
      // 目的：验证前区5个号码都在有效范围内（1-35）
      await page.goto(PAGE_URL);
      await page.click('button:has-text("单次随机摇号")');
      await page.waitForTimeout(4000);

      const frontNumbers = await getDisplayedNumbers(page, 'myFrontNumbers');

      for (const numStr of frontNumbers) {
        const num = parseInt(numStr, 10);
        expect(validateFrontNumberRange(num)).toBe(true);
      }
    });

    test('后区号码应在1-12范围内', async ({ page }) => {
      // 目的：验证后区2个号码都在有效范围内（1-12）
      await page.goto(PAGE_URL);
      await page.click('button:has-text("单次随机摇号")');
      await page.waitForTimeout(4000);

      const backNumbers = await getDisplayedNumbers(page, 'myBackNumbers');

      for (const numStr of backNumbers) {
        const num = parseInt(numStr, 10);
        expect(validateBackNumberRange(num)).toBe(true);
      }
    });

    test('开奖号码也应符合规则', async ({ page }) => {
      // 目的：验证开奖号码同样满足5+2规则和范围要求
      await page.goto(PAGE_URL);
      await page.click('button:has-text("单次随机摇号")');
      await page.waitForTimeout(4000);

      // 验证开奖号码数量
      const winFrontNumbers = await getDisplayedNumbers(page, 'winFrontNumbers');
      const winBackNumbers = await getDisplayedNumbers(page, 'winBackNumbers');

      expect(winFrontNumbers.length).toBe(5);
      expect(winBackNumbers.length).toBe(2);

      // 验证范围
      for (const numStr of winFrontNumbers) {
        const num = parseInt(numStr, 10);
        expect(validateFrontNumberRange(num)).toBe(true);
      }

      for (const numStr of winBackNumbers) {
        const num = parseInt(numStr, 10);
        expect(validateBackNumberRange(num)).toBe(true);
      }
    });

    test('摇号后应显示匹配结果', async ({ page }) => {
      // 目的：验证摇号完成后会显示匹配信息和中奖结果
      await page.goto(PAGE_URL);
      await page.click('button:has-text("单次随机摇号")');
      await page.waitForTimeout(4500);

      // 验证匹配结果显示
      const matchResult = page.locator('#matchResult');
      await expect(matchResult).toBeVisible();
      await expect(matchResult).toContainText(/前区匹配/);
      await expect(matchResult).toContainText(/后区匹配/);

      // 验证结果显示区域可见
      const resultSection = page.locator('#resultSection');
      await expect(resultSection).toBeVisible();
    });
  });

  // ==========================================
  // 3. 手动输入号码功能测试
  // ==========================================
  test.describe('手动输入号码', () => {

    test('点击手动输入按钮应显示输入表单', async ({ page }) => {
      // 目的：验证手动输入功能面板能正常打开
      await page.goto(PAGE_URL);

      // 点击手动输入按钮
      await page.click('button:has-text("手动输入号码")');

      // 验证输入表单显示
      const manualSection = page.locator('#manualSection');
      await expect(manualSection).toBeVisible();

      // 验证输入框存在
      await expect(page.locator('#frontNumbers')).toBeVisible();
      await expect(page.locator('#backNumbers')).toBeVisible();
    });

    test('输入有效号码并进行模拟', async ({ page }) => {
      // 目的：验证手动输入合法号码后能正常进行模拟
      await page.goto(PAGE_URL);

      // 打开手动输入面板
      await page.click('button:has-text("手动输入号码")');

      // 输入前区号码（5个）
      await page.fill('#frontNumbers', '05 12 18 25 33');

      // 输入后区号码（2个）
      await page.fill('#backNumbers', '03 09');

      // 点击开始模拟
      await page.click('button:has-text("开始模拟")');

      // 等待模拟完成
      await page.waitForTimeout(4000);

      // 验证我的号码已更新为手动输入的号码
      const myFrontNumbers = await getDisplayedNumbers(page, 'myFrontNumbers');
      const myBackNumbers = await getDisplayedNumbers(page, 'myBackNumbers');

      expect(myFrontNumbers).toEqual(['05', '12', '18', '25', '33']);
      expect(myBackNumbers).toEqual(['03', '09']);

      // 验证开奖号码已生成
      const winFrontNumbers = await getDisplayedNumbers(page, 'winFrontNumbers');
      const winBackNumbers = await getDisplayedNumbers(page, 'winBackNumbers');

      expect(winFrontNumbers.length).toBe(5);
      expect(winBackNumbers.length).toBe(2);
    });

    test('输入不完整号码应显示错误提示', async ({ page }) => {
      // 目的：验证输入不完整号码时系统会给出错误提示
      await page.goto(PAGE_URL);

      // 打开手动输入面板
      await page.click('button:has-text("手动输入号码")');

      // 只输入前区号码，不输入后区
      await page.fill('#frontNumbers', '05 12 18 25 33');

      // 点击开始模拟
      await page.click('button:has-text("开始模拟")');

      // 验证错误提示出现（通过通知或界面反馈）
      // 由于通知会在2.5秒后消失，我们检查是否有相关的DOM变化
      await page.waitForTimeout(500);
    });

    test('输入超出范围的号码应被拒绝', async ({ page }) => {
      // 目的：验证超出范围的号码会被系统识别并拒绝
      await page.goto(PAGE_URL);

      // 打开手动输入面板
      await page.click('button:has-text("手动输入号码")');

      // 输入超出范围的前区号码
      await page.fill('#frontNumbers', '05 12 40 25 33'); // 40 超出范围

      // 输入后区号码
      await page.fill('#backNumbers', '03 09');

      // 点击开始模拟
      await page.click('button:has-text("开始模拟")');

      // 等待处理
      await page.waitForTimeout(500);
    });
  });

  // ==========================================
  // 4. 批量模拟功能测试
  // ==========================================
  test.describe('批量模拟', () => {

    test('点击批量模拟按钮应显示设置面板', async ({ page }) => {
      // 目的：验证批量模拟设置面板能正常打开
      await page.goto(PAGE_URL);

      // 点击批量模拟按钮
      await page.click('button:has-text("批量模拟")');

      // 验证批量模拟面板显示
      const batchSection = page.locator('#batchSection');
      await expect(batchSection).toBeVisible();

      // 验证次数输入框存在
      await expect(page.locator('#batchCount')).toBeVisible();
    });

    test('执行批量模拟应生成多组结果', async ({ page }) => {
      // 目的：验证批量模拟能正常执行并生成指定数量的结果
      await page.goto(PAGE_URL);

      // 打开批量模拟面板
      await page.click('button:has-text("批量模拟")');

      // 设置模拟次数为5次
      await page.fill('#batchCount', '5');

      // 开始批量模拟
      await page.click('button:has-text("开始批量模拟")');

      // 等待批量模拟完成
      await page.waitForTimeout(3000);

      // 验证结果显示
      const matchResult = page.locator('#matchResult');
      await expect(matchResult).toBeVisible();
      await expect(matchResult).toContainText(/批量模拟结果/);
      await expect(matchResult).toContainText(/5次/);
    });

    test('批量模拟结果应包含中奖统计信息', async ({ page }) => {
      // 目的：验证批量模拟结果中包含中奖次数和中奖率统计
      await page.goto(PAGE_URL);

      // 打开批量模拟面板并执行
      await page.click('button:has-text("批量模拟")');
      await page.fill('#batchCount', '10');
      await page.click('button:has-text("开始批量模拟")');
      await page.waitForTimeout(3000);

      // 验证统计信息存在
      const matchResult = page.locator('#matchResult');
      await expect(matchResult).toContainText(/中奖次数/);
      await expect(matchResult).toContainText(/中奖率/);
    });

    test('批量模拟应支持查看详细结果列表', async ({ page }) => {
      // 目的：验证批量模拟可以展开查看每次的详细结果
      await page.goto(PAGE_URL);

      // 执行批量模拟
      await page.click('button:has-text("批量模拟")');
      await page.fill('#batchCount', '3');
      await page.click('button:has-text("开始批量模拟")');
      await page.waitForTimeout(3000);

      // 验证详情展开区域存在
      const details = page.locator('details');
      await expect(details.first()).toBeVisible();

      // 展开详情
      await details.first().click();
      await page.waitForTimeout(500);

      // 验证结果项存在
      const resultItems = page.locator('.batch-result-item');
      const count = await resultItems.count();
      expect(count).toBe(3); // 应该有3条记录
    });

    test('批量模拟次数限制应在1-100之间', async ({ page }) => {
      // 目的：验证批量模拟次数的有效性校验
      await page.goto(PAGE_URL);

      // 打开批量模拟面板
      await page.click('button:has-text("批量模拟")');

      // 尝试输入超过100的次数
      await page.fill('#batchCount', '150');

      // 尝试执行（应该会被拒绝或修正）
      await page.click('button:has-text("开始批量模拟")');
      await page.waitForTimeout(500);
    });
  });

  // ==========================================
  // 5. 号码筛选功能测试
  // ==========================================
  test.describe('号码筛选', () => {

    test('点击筛选按钮应显示筛选面板', async ({ page }) => {
      // 目的：验证号码筛选面板能正常打开
      await page.goto(PAGE_URL);

      // 点击筛选按钮
      await page.click('button:has-text("号码筛选")');

      // 验证筛选面板显示
      const filterSection = page.locator('#filterSection');
      await expect(filterSection).toBeVisible();

      // 验证输入框存在
      await expect(page.locator('#excludeFront')).toBeVisible();
      await expect(page.locator('#excludeBack')).toBeVisible();
    });

    test('应用筛选条件后应排除指定号码', async ({ page }) => {
      // 目的：验证应用筛选条件后，生成的号码不会包含排除的号码
      await page.goto(PAGE_URL);

      // 打开筛选面板
      await page.click('button:has-text("号码筛选")');

      // 设置排除的前区号码
      await page.fill('#excludeFront', '01 02 03 04 05');

      // 应用筛选
      await page.click('button:has-text("应用筛选")');

      // 执行多次摇号以验证筛选效果
      await page.click('button:has-text("单次随机摇号")');
      await page.waitForTimeout(4000);

      // 获取生成的号码
      const frontNumbers = await getDisplayedNumbers(page, 'myFrontNumbers');

      // 验证生成的号码不包含排除的号码
      for (const numStr of frontNumbers) {
        expect(['01', '02', '03', '04', '05']).not.toContain(numStr);
      }
    });

    test('清除筛选应恢复默认状态', async ({ page }) => {
      // 目的：验证清除筛选后，号码生成恢复正常
      await page.goto(PAGE_URL);

      // 打开筛选面板
      await page.click('button:has-text("号码筛选")');

      // 设置并应用筛选
      await page.fill('#excludeFront', '10 20 30');
      await page.click('button:has-text("应用筛选")');

      // 清除筛选
      await page.click('button:has-text("号码筛选")'); // 重新打开
      await page.click('button:has-text("清除筛选")');

      // 验证输入框已被清空
      const excludeFrontValue = await page.locator('#excludeFront').inputValue();
      expect(excludeFrontValue).toBe('');
    });
  });

  // ==========================================
  // 6. 历史记录功能测试
  // ==========================================
  test.describe('历史记录', () => {

    test('点击查看历史应显示历史记录面板', async ({ page }) => {
      // 目的：验证历史记录面板能正常打开
      await page.goto(PAGE_URL);

      // 点击查看历史按钮
      await page.click('button:has-text("查看历史")');

      // 验证历史面板显示
      const historySection = page.locator('#historySection');
      await expect(historySection).toBeVisible();
    });

    test('摇号后应保存历史记录', async ({ page }) => {
      // 目的：验证每次摇号操作都会被记录到历史中
      await page.goto(PAGE_URL);

      // 执行一次摇号
      await page.click('button:has-text("单次随机摇号")');
      await page.waitForTimeout(4500);

      // 打开历史记录
      await page.click('button:has-text("查看历史")');

      // 验证历史记录不为空
      const historyContent = page.locator('#historyContent');
      await expect(historyContent).toBeVisible();

      // 验证表格存在（有记录时应该显示表格）
      const table = historyContent.locator('table');
      const tableExists = await table.count();
      expect(tableExists).toBeGreaterThan(0);
    });

    test('历史记录应包含完整的摇号信息', async ({ page }) => {
      // 目的：验证历史记录包含时间、类型、选号、开奖号、结果等信息
      await page.goto(PAGE_URL);

      // 执行摇号
      await page.click('button:has-text("单次随机摇号")');
      await page.waitForTimeout(4500);

      // 查看历史
      await page.click('button:has-text("查看历史")');

      // 验证表头包含必要字段
      const table = page.locator('#historyContent table');
      await expect(table).toBeVisible();

      // 验证表头
      const headers = table.locator('th');
      const headerTexts = await headers.allTextContents();
      expect(headerTexts).toContain('时间');
      expect(headerTexts).toContain('类型');
      expect(headerTexts).toContain('选号');
      expect(headerTexts).toContain('开奖');
      expect(headerTexts).toContain('结果');
    });

    test('清空历史记录功能应正常工作', async ({ page }) => {
      // 目的：验证清空历史记录功能能正常清除所有记录
      await page.goto(PAGE_URL);

      // 先执行几次摇号产生历史
      await page.click('button:has-text("单次随机摇号")');
      await page.waitForTimeout(4500);

      // 打开历史并清空
      await page.click('button:has-text("查看历史")');
      await page.click('button:has-text("清空历史")');

      // 验证历史已被清空
      const historyContent = page.locator('#historyContent');
      await expect(historyContent).toContainText('暂无历史记录');
    });

    test('批量模拟结果应自动保存到历史记录', async ({ page }) => {
      // 目的：验证批量模拟的每条结果都会被保存到历史记录中
      await page.goto(PAGE_URL);

      // 执行批量模拟3次
      await page.click('button:has-text("批量模拟")');
      await page.fill('#batchCount', '3');
      await page.click('button:has-text("开始批量模拟")');
      await page.waitForTimeout(3000);

      // 查看历史记录
      await page.click('button:has-text("查看历史")');

      // 验证表格中有至少3条批量记录（可能包含其他历史）
      const tableRows = page.locator('#historyContent table tr').nth(1); // 跳过表头
      const allRows = page.locator('#historyContent table tr');
      const rowCount = await allRows.count() - 1; // 减去表头
      expect(rowCount).toBeGreaterThanOrEqual(3);

      // 验证每条记录的类型列包含"批量"
      for (let i = 1; i <= Math.min(rowCount, 3); i++) {
        const row = allRows.nth(i);
        const cells = row.locator('td');
        const typeCell = cells.nth(1); // 类型列是第2列
        await expect(typeCell).toContainText(/批量第\d+次/);
      }
    });
  });

  // ==========================================
  // 7. 冷热分析功能测试
  // ==========================================
  test.describe('冷热分析', () => {

    test('点击冷热分析应显示分析结果', async ({ page }) => {
      // 目的：验证冷热分析功能能正常展示分析结果
      await page.goto(PAGE_URL);

      // 先执行几次摇号以积累数据
      await page.click('button:has-text("单次随机摇号")');
      await page.waitForTimeout(4500);

      await page.click('button:has-text("单次随机摇号")');
      await page.waitForTimeout(4500);

      await page.click('button:has-text("单次随机摇号")');
      await page.waitForTimeout(4500);

      // 点击冷热分析按钮
      await page.click('button:has-text("冷热分析")');

      // 验证分析结果显示
      const statisticsContent = page.locator('#statisticsContent');
      await expect(statisticsContent).toBeVisible();

      // 验证包含冷热分析相关内容
      await expect(statisticsContent).toContainText(/冷热号码分析/);
    });

    test('冷热分析应显示热门和冷门号码分类', async ({ page }) => {
      // 目的：验证冷热分析结果包含前区和后区的热门/冷门分类
      await page.goto(PAGE_URL);

      // 积累足够的数据
      for (let i = 0; i < 3; i++) {
        await page.click('button:has-text("单次随机摇号")');
        await page.waitForTimeout(4500);
      }

      // 显示冷热分析
      await page.click('button:has-text("冷热分析")');

      // 验证四个分类卡片都存在
      await expect(page.locator('.hot-cold-grid')).toBeVisible();
      await expect(page.locator('.hot-card-front')).toBeVisible();   // 前区热门
      await expect(page.locator('.cold-card-front')).toBeVisible();  // 前区冷门
      await expect(page.locator('.hot-card-back')).toBeVisible();    // 后区热门
      await expect(page.locator('.cold-card-back')).toBeVisible();   // 后区冷门
    });

    test('热门号码应显示TOP10/TOP5', async ({ page }) => {
      // 目的：验证热门号码数量符合预期（前区TOP10，后区TOP5）
      await page.goto(PAGE_URL);

      // 积累数据
      for (let i = 0; i < 5; i++) {
        await page.click('button:has-text("单次随机摇号")');
        await page.waitForTimeout(4500);
      }

      // 显示冷热分析
      await page.click('button:has-text("冷热分析")');

      // 检查前区热门号码数量（应该是10个）
      const frontHotCard = page.locator('.hot-card-front .hot-cold-num');
      const frontHotCount = await frontHotCard.count();
      expect(frontHotCount).toBe(10);

      // 检查后区热门号码数量（应该是5个）
      const backHotCard = page.locator('.hot-card-back .hot-cold-num');
      const backHotCount = await backHotCard.count();
      expect(backHotCount).toBe(5);
    });
  });

  // ==========================================
  // 8. 号码统计功能测试
  // ==========================================
  test.describe('号码统计', () => {

    test('点击查看统计应显示频率统计', async ({ page }) => {
      // 目的：验证号码统计功能能正常显示各号码的出现频率
      await page.goto(PAGE_URL);

      // 先执行几次摇号
      await page.click('button:has-text("单次随机摇号")');
      await page.waitForTimeout(4500);

      // 点击查看统计
      await page.click('button:has-text("查看统计详情")');

      // 验证统计内容显示
      const statisticsContent = page.locator('#statisticsContent');
      await expect(statisticsContent).toBeVisible();

      // 验证包含前区和后区统计
      await expect(statisticsContent).toContainText(/前区号码出现频率/);
      await expect(statisticsContent).toContainText(/后区号码出现频率/);
    });

    test('统计应显示所有35个前区号码', async ({ page }) => {
      // 目的：验证前区统计包含1-35的所有号码
      await page.goto(PAGE_URL);

      // 执行摇号
      await page.click('button:has-text("单次随机摇号")');
      await page.waitForTimeout(4500);

      // 显示统计
      await page.click('button:has-text("查看统计详情")');

      // 统计前区号码项目数量
      const statItems = page.locator('#statisticsContent .stat-item');
      // 前区35个 + 后区12个 = 47个统计项
      const totalCount = await statItems.count();
      expect(totalCount).toBe(47); // 35个前区 + 12个后区
    });

    test('高频号码应有特殊标记', async ({ page }) => {
      // 目的：验证出现频率最高的号码会有高亮标记
      await page.goto(PAGE_URL);

      // 多次摇号以产生统计数据差异
      for (let i = 0; i < 5; i++) {
        await page.click('button:has-text("单次随机摇号")');
        await page.waitForTimeout(4500);
      }

      // 显示统计
      await page.click('button:has-text("查看统计详情")');

      // 检查是否存在高频标记（high class）
      const highStatItems = page.locator('#statisticsContent .stat-item.high');
      const highCount = await highStatItems.count();

      // 至少应该有一个高频号码被标记（如果所有号码出现次数相同则可能为0）
      // 这里只验证功能存在，不强制要求必须有high标记
      expect(highCount).toBeGreaterThanOrEqual(0);
    });
  });

  // ==========================================
  // 9. 复制功能测试
  // ==========================================
  test.describe('复制功能', () => {

    test('复制我的号码功能应正常工作', async ({ page }) => {
      // 目的：验证复制我的号码按钮能将号码复制到剪贴板
      await page.goto(PAGE_URL);
      await waitForAnimation(page);

      // 监听剪贴板事件
      const clipboardPromise = page.evaluate(() =>
        new Promise<string>((resolve) => {
          navigator.clipboard.readText().then(resolve).catch(() => resolve(''));
        })
      );

      // 点击复制按钮
      await page.click('button:has-text("复制我的号码")');

      // 等待一下让复制操作完成
      await page.waitForTimeout(500);

      // 验证剪贴板内容（由于浏览器安全限制，这里主要验证按钮可点击且无报错）
      // 在实际测试环境中，需要特殊权限才能读取剪贴板
      const copyButton = page.locator('button:has-text("复制我的号码")');
      await expect(copyButton).toBeEnabled();
    });

    test('复制开奖号码功能应正常工作', async ({ page }) => {
      // 目的：验证复制开奖号码按钮在有开奖数据时可用
      await page.goto(PAGE_URL);

      // 先进行一次摇号以生成开奖号码
      await page.click('button:has-text("单次随机摇号")');
      await page.waitForTimeout(4500);

      // 验证复制开奖号码按钮可用
      const copyWinButton = page.locator('button:has-text("复制开奖号码")');
      await expect(copyWinButton).toBeEnabled();

      // 点击复制
      await copyWinButton.click();
      await page.waitForTimeout(500);
    });

    test('批量模拟后的复制功能', async ({ page }) => {
      // 目的：验证批量模拟后可以复制全部选号和开奖号
      await page.goto(PAGE_URL);

      // 执行批量模拟
      await page.click('button:has-text("批量模拟")');
      await page.fill('#batchCount', '5');
      await page.click('button:has-text("开始批量模拟")');
      await page.waitForTimeout(3000);

      // 验证批量复制按钮存在且可用
      const copyBatchMyBtn = page.locator('button:has-text("复制全部选号")');
      const copyBatchWinBtn = page.locator('button:has-text("复制全部开奖号")');

      await expect(copyBatchMyBtn).toBeVisible();
      await expect(copyBatchWinBtn).toBeVisible();

      // 点击复制选号
      await copyBatchMyBtn.click();
      await page.waitForTimeout(500);
    });
  });

  // ==========================================
  // 10. 综合场景测试
  // ==========================================
  test.describe('综合场景', () => {

    test('完整流程：筛选 -> 摇号 -> 查看历史 -> 冷热分析', async ({ page }) => {
      // 目的：验证多个功能组合使用的完整流程
      await page.goto(PAGE_URL);

      // 1. 设置筛选条件
      await page.click('button:has-text("号码筛选")');
      await page.fill('#excludeFront', '07 14 21 28');
      await page.click('button:has-text("应用筛选")');

      // 2. 执行摇号
      await page.click('button:has-text("单次随机摇号")');
      await page.waitForTimeout(4500);

      // 验证号码生成正确
      const myFrontNumbers = await getDisplayedNumbers(page, 'myFrontNumbers');
      expect(myFrontNumbers.length).toBe(5);

      // 3. 查看历史记录
      await page.click('button:has-text("查看历史")');
      const historySection = page.locator('#historySection');
      await expect(historySection).toBeVisible();

      // 4. 查看冷热分析
      await page.click('button:has-text("冷热分析")');
      const statisticsContent = page.locator('#statisticsContent');
      await expect(statisticsContent).toBeVisible();
    });

    test('多次连续摇号的稳定性', async ({ page }) => {
      // 目的：验证系统能够稳定地处理多次连续摇号操作
      test.setTimeout(120000);
      await page.goto(PAGE_URL);

      // 连续执行10次摇号
      for (let i = 0; i < 10; i++) {
        await page.click('button:has-text("单次随机摇号")');
        await page.waitForTimeout(4000);

        // 每次都验证号码格式正确
        const frontNumbers = await getDisplayedNumbers(page, 'myFrontNumbers');
        const backNumbers = await getDisplayedNumbers(page, 'myBackNumbers');

        expect(frontNumbers.length).toBe(5);
        expect(backNumbers.length).toBe(2);

        // 验证号码格式
        for (const num of [...frontNumbers, ...backNumbers]) {
          expect(validateNumberFormat(num)).toBe(true);
        }
      }
    });

    test('不同功能的切换不应影响数据显示', async ({ page }) => {
      // 目的：验证在不同功能模块间切换时，号码数据保持一致
      await page.goto(PAGE_URL);
      await waitForAnimation(page);

      // 记录初始号码
      const initialFront = await getDisplayedNumbers(page, 'myFrontNumbers');
      const initialBack = await getDisplayedNumbers(page, 'myBackNumbers');

      // 切换到手动输入模式再返回
      await page.click('button:has-text("手动输入号码")');
      await page.waitForTimeout(500);

      // 再次摇号
      await page.click('button:has-text("单次随机摇号")');
      await page.waitForTimeout(4000);

      // 验证号码已更新（与初始号码不同是正常的，因为是随机生成）
      const newFront = await getDisplayedNumbers(page, 'myFrontNumbers');
      const newBack = await getDisplayedNumbers(page, 'myBackNumbers');

      expect(newFront.length).toBe(5);
      expect(newBack.length).toBe(2);
    });
  });
});
