import random
# 前区
nums =sorted( random.sample(range(1,36),5) )
formatted = [f"{num:02}" for num in nums]
result = " ".join(formatted)
# 后区
nums1 =sorted(random.sample(range(1,13),2))
formatted1 = [f"{num:02}" for num in nums1]
result1 = " ".join(formatted1)



# 5次输出
for i in range(5):
    front_nums =sorted( random.sample(range(1,36),5) )
    back_nums =sorted(random.sample(range(1,13),2))
    front_result = " ".join([f"{num:02}" for num in front_nums])
    back_result = " ".join([f"{num:02}" for num in back_nums])
    print(front_result+" + "+back_result)

    