# 读取文件
with open('Invite.vue', 'r') as f:
    content = f.read()

# 修改链接生成方式：从子域名改为路径链接
# 旧: https://.agx.bi/
# 新: https://agx.bi/register?ref=

old_line = inviteLink.value = 
new_line = inviteLink.value = 

content = content.replace(old_line, new_line)

# 保存
with open('Invite.vue', 'w') as f:
    f.write(content)

print('Fixed! Link now uses path instead of subdomain.')
