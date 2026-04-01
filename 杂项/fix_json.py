import re

with open('spots.json', 'r', encoding='utf-8') as f:
    lines = f.readlines()

fixed_lines = []

for line_num, line in enumerate(lines, 1):
    if line_num == 83:
        line = line.replace('被誉为"江南名园"。', '被誉为\\"江南名园\\"。')
    elif line_num == 91:
        line = line.replace('原为上海县城隍神秦裕伯的办公场所。', '原为上海县城隍神秦裕伯的办公场所。')
    elif line_num == 92:
        line = line.replace('原名"龙华教寺"', '原名\\"龙华教寺\\"')
    elif line_num == 93:
        line = line.replace('被誉为"沪上第一刹"。', '被誉为\\"沪上第一刹\\"。')
    elif line_num == 94:
        line = line.replace('原名"沪渎重玄寺"', '原名\\"沪渎重玄寺\\"')
    elif line_num == 95:
        line = line.replace('原名"沪渎重玄寺"', '原名\\"沪渎重玄寺\\"')
    elif line_num == 96:
        line = line.replace('原名"静安讲寺"', '原名\\"静安讲寺\\"')
    elif line_num == 97:
        line = line.replace('原名"南京路"', '原名\\"南京路\\"')
    elif line_num == 98:
        line = line.replace('原名"霞飞路"', '原名\\"霞飞路\\"')
    
    fixed_lines.append(line)

with open('spots.json', 'w', encoding='utf-8') as f:
    f.writelines(fixed_lines)

print("JSON 修复完成")
