#!/bin/bash

BASE_DIR="$(cd "$(dirname "$0")" && pwd)"

# ===================== 配置区（可根据需要修改）=====================
# 定义要处理的文件数组（支持多个文件）
FILES=(
	"workbench.desktop.main.js"  # 目标文件1（JS）
	"workbench.desktop.main.css" # 目标文件2（CSS）
)
# 源文件目录（存放替换用的文件）
SOURCE_DIR="${BASE_DIR}/workbench"
# 目标文件根目录（Trae CN 安装目录）
TARGET_ROOT="/Applications/Trae CN.app/Contents/Resources/app/out/vs/workbench"
# ==================================================================



# 替换workbench中的源文件
replace_workbench_files() {
	if [ ! -d "$SOURCE_DIR" ]; then
		echo "❌ 源文件目录不存在：$SOURCE_DIR"
		exit 1
	fi

	echo "📝 开始批量替换文件..."
	for file in "${FILES[@]}"; do
		# 拼接完整路径
		source_file="${SOURCE_DIR}/${file}.txt" # 源文件
		target_file="${TARGET_ROOT}/${file}" # 目标文件
	
		backup_file="${target_file}.bak"
		if [ ! -f "$backup_file" ]; then
			echo "✅ 创建备份文件：$backup_file"
			cp -f "$target_file" "$backup_file"
		fi

		if [[ -f "$source_file" ]]; then
			cp -f "$source_file" "$target_file" && {
				echo "✅ 替换成功：$target_file"
			}|| {
				echo -e "❌ 替换失败：\n$source_file\n$target_file"
				exit 1
			}
		else
			echo -e "⚠️  源文件或目标文件不存在：\n$source_file\n$target_file"
			exit 1
		fi
	done
	echo "✅ 批量替换操作完成！"
}


# 备份workbench文件
backup_workbench_files(){
	mkdir -p "$SOURCE_DIR"
	for file in "${FILES[@]}"; do
		source_file="${SOURCE_DIR}/${file}" 
		target_file="${TARGET_ROOT}/${file}"
		
		if [ ! -f "${target_file}.bak" ]; then
			echo "✅ 备份目标源文件"
			cp -f "$target_file" "${target_file}.bak"
		fi

		if [ -f "${source_file}.bak" ]; then
			echo "✅ 项目备份文件已存在，跳过备份"
			continue
		fi
		
		echo "✅ 拷贝源备份文件到项目目录"
		cp -f "${target_file}.bak" "${source_file}"


		if [[ "$source_file" == *".js" ]]; then
			
			echo "正在格式化文件，请稍后..."
			prettier --cache "$source_file" > "${source_file}.txt" && {
				echo "✅ 格式化成功"
				cp -f "${source_file}.txt" "${source_file}.bak"
				mv "${source_file}" "${source_file}.source"
			}
		else
			mv "$source_file" "${source_file}.bak"
			cp -f "${source_file}.bak" "${source_file}.txt"
		fi

	done
}




# 还原workbench中的备份文件
restore_workbench_files() {
	echo "📝 开始批量还原文件..."
	for file in "${FILES[@]}"; do
		# 拼接完整路径
		target_file="${TARGET_ROOT}/${file}" # 目标文件
		
		backup_file="${target_file}.bak"

		if [ ! -f "$backup_file" ]; then
			echo -e "⚠️  备份文件不存在：\n$backup_file"
			exit 1
		fi

		# 执行还原
		echo "🔙 还原文件：$backup_file -> $target_file"
		cp -f "$backup_file" "$target_file" || {
			echo -e "❌ 还原失败：\n$target_file"
			exit 1
		}
	done
	echo -e "\n✅ 批量还原操作完成！"
}





# 显示帮助信息
show_help() {
	cat <<EOF
	选项：
	-r    批量替换Workbench文件
	-a    批量还原Workbench文件
	-b    批量备份Workbench文件
	-h    显示帮助信息
EOF

}



# 重启Trae CN应用
restart_traeCN_app() {
	# 先判断应用是否在运行，运行中才执行重启操作
	if pgrep -f "Trae CN" > /dev/null; then
		echo "检测到 Trae CN 已启动，正在重启应用..."
		pkill -9 -f "Trae CN"
		sleep 2
		open "/Applications/Trae CN.app"
	else
		echo "未检测到 Trae CN 启动，跳过重启操作。"
	fi

}

# 主逻辑：解析命令行参数
if [ $# -eq 0 ]; then
	echo "❌ 请指定操作选项！"
	show_help
	exit 1
fi

case "$1" in
	-r)
		replace_workbench_files
		restart_traeCN_app
		;;
	-b)
		backup_workbench_files
		;;
	-a)
		restore_workbench_files
		restart_traeCN_app
		;;
	-h)
		show_help
		;;
	*)
		echo "❌ 无效的选项：$1"
		show_help
		exit 1
	;;
esac
