import random
from typing import List, Tuple

class DaLeTouSimulator:
    def __init__(self):
        self.front_numbers = []  # 前区号码 (1-35)
        self.back_numbers = []   # 后区号码 (1-12)
    
    def generate_lottery_numbers(self) -> Tuple[List[int], List[int]]:
        """
        生成一组大乐透号码
        :return: (前区号码列表, 后区号码列表)
        """
        # 前区随机选择5个号码 (范围1-35)
        front_numbers = sorted(random.sample(range(1, 36), 5))
        
        # 后区随机选择2个号码 (范围1-12)
        back_numbers = sorted(random.sample(range(1, 13), 2))
        
        return front_numbers, back_numbers
    
    def draw_winning_numbers(self) -> Tuple[List[int], List[int]]:
        """
        模拟开奖，产生中奖号码
        :return: (中奖前区号码, 中奖后区号码)
        """
        print("正在开奖...")
        winning_front, winning_back = self.generate_lottery_numbers()
        print(f"中奖号码: 前区 {' '.join(map(str, winning_front))} | 后区 {' '.join(map(str, winning_back))}")
        return winning_front, winning_back
    
    def simulate_drawing(self, user_numbers: Tuple[List[int], List[int]] = None) -> None:
        """
        模拟一次摇号过程
        :param user_numbers: 用户选择的号码，如果为None则随机生成
        """
        if user_numbers is None:
            user_numbers = self.generate_lottery_numbers()
        
        print("=" * 50)
        print("大乐透摇号模拟器")
        print("=" * 50)
        
        print(f"您的号码: 前区 {' '.join(map(str, user_numbers[0]))} | 后区 {' '.join(map(str, user_numbers[1]))}")
        
        winning_numbers = self.draw_winning_numbers()
        
        # 计算匹配情况
        front_matches = len(set(user_numbers[0]) & set(winning_numbers[0]))
        back_matches = len(set(user_numbers[1]) & set(winning_numbers[1]))
        
        print(f"\n匹配结果:")
        print(f"前区匹配 {front_matches} 个: {sorted(list(set(user_numbers[0]) & set(winning_numbers[0])))}")
        print(f"后区匹配 {back_matches} 个: {sorted(list(set(user_numbers[1]) & set(winning_numbers[1])))}")
        
        # 判断中奖等级
        prize_level = self.determine_prize_level(front_matches, back_matches)
        if prize_level:
            print(f"恭喜您获得: {prize_level}")
        else:
            print("很遗憾，未中奖，请再接再厉！")
        
        print("=" * 50)
    
    def determine_prize_level(self, front_matches: int, back_matches: int) -> str:
        """
        根据匹配情况确定奖项等级
        """
        # 大乐透奖项规则
        prize_rules = {
            (5, 2): "一等奖",
            (5, 1): "二等奖",
            (5, 0): "三等奖",
            (4, 2): "四等奖",
            (4, 1): "五等奖",
            (3, 2): "五等奖",
            (4, 0): "六等奖",
            (3, 1): "六等奖",
            (2, 2): "六等奖",
            (3, 0): "七等奖",
            (2, 1): "七等奖",
            (1, 2): "七等奖",
            (2, 0): "八等奖",
            (1, 1): "八等奖",
            (0, 2): "八等奖",
            (1, 0): "九等奖",
            (0, 1): "九等奖",
            (0, 0): ""
        }
        
        return prize_rules.get((front_matches, back_matches), "")
    
    def batch_simulation(self, times: int = 1) -> None:
        """
        批量模拟摇号
        :param times: 模拟次数
        """
        for i in range(times):
            if times > 1:
                print(f"\n第 {i+1} 次模拟:")
            self.simulate_drawing()

def main():
    simulator = DaLeTouSimulator()
    
    while True:
        print("\n请选择功能:")
        print("1. 单次摇号模拟")
        print("2. 手动输入号码模拟")
        print("3. 批量摇号模拟")
        print("4. 退出")
        
        choice = input("请输入选项 (1-4): ").strip()
        
        if choice == '1':
            simulator.simulate_drawing()
        
        elif choice == '2':
            try:
                print("请输入您的号码:")
                front_input = input("前区号码 (5个，空格分隔，如: 1 5 8 9 20): ").split()
                back_input = input("后区号码 (2个，空格分隔，如: 3 12): ").split()
                
                front_numbers = [int(n) for n in front_input]
                back_numbers = [int(n) for n in back_input]
                
                if len(front_numbers) != 5 or len(back_numbers) != 2:
                    print("号码数量不正确！前区应为5个，后区应为2个")
                    continue
                
                if not all(1 <= n <= 35 for n in front_numbers) or not all(1 <= n <= 12 for n in back_numbers):
                    print("号码超出范围！前区应在1-35之间，后区应在1-12之间")
                    continue
                
                user_numbers = (sorted(front_numbers), sorted(back_numbers))
                simulator.simulate_drawing(user_numbers)
            
            except ValueError:
                print("输入格式错误，请输入数字！")
        
        elif choice == '3':
            try:
                times = int(input("请输入模拟次数: "))
                if times <= 0:
                    print("次数必须大于0")
                    continue
                simulator.batch_simulation(times)
            except ValueError:
                print("请输入有效的数字")
        
        elif choice == '4':
            print("感谢使用大乐透摇号模拟器！")
            break
        
        else:
            print("无效选项，请重新选择")

if __name__ == "__main__":
    main()