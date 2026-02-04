#!/bin/bash

echo ""
echo "广场标题栏优化选项"
echo "====================="
echo ""
echo "方案1: 只AGX图标 (最简洁)"
echo "   - 保留: logo-icon span"
echo "   - 删除: header-actions div"
echo ""
echo "方案2: AGX + 刷新按钮 (常用)"
echo "   - 保留: logo-icon span + header-actions"
echo "   - 删除: 搜索按钮"
echo ""
echo "方案3: AGX + 搜索按钮"
echo "   - 保留: logo-icon span + header-actions"
echo "   - 删除: 刷新按钮"
echo ""
echo "方案4: 只AGX图标，无按钮"
echo "   - 保留: logo-icon span"
echo "   - 删除: header-actions div"
echo ""
echo "===================="
echo ""
echo "选择要应用的方案 (1-4): " && read choice
echo ""
case $choice in
    1) echo "应用方案1: 只保留AGX图标" ;;
    2) echo "应用方案2: AGX + 刷新按钮" ;;
    3) echo "应用方案3: AGX + 搜索按钮" ;; 
    4) echo "应用方案4: 只AGX图标，无按钮" ;;
    *) echo "无效选项"
esac
