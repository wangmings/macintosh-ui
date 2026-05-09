#!/bin/bash

BASE_DIR="$(cd "$(dirname "$0")" && pwd)"

# 定义工作目录
APP_ROOT="/Applications/Trae CN.app/Contents/Resources/app"
TARGET_ROOT="${APP_ROOT}/out/vs/workbench"

# 获取当前版本号
VERSION=$(jq -r .version "${APP_ROOT}/package.json")
SOURCE_DIR="${BASE_DIR}/workbench/${VERSION}"

# 查找目标目录中所有非备份文件
FILE_NAMES=$(find "$TARGET_ROOT" -maxdepth 1 -type f ! -name "*.bak" -exec basename {} \;)
if [ -z "$FILE_NAMES" ]; then
	echo "❌ 目标目录中没有文件"
	exit 1
fi



# 替换workbench中的源文件
replace_workbench_files() {

	echo "📝 开始批量替换文件..."
	while read -r file; do
		# 拼接完整路径
		source_file="${SOURCE_DIR}/${file}"  # 源文件
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
	done <<< "$FILE_NAMES"
	echo "✅ 批量替换操作完成！"
}


# 备份workbench文件
backup_workbench_files(){
	mkdir -p "$SOURCE_DIR"
	echo "📝 开始批量备份文件..."
	while read -r file; do
		source_file="${SOURCE_DIR}/${file}" 
		target_file="${TARGET_ROOT}/${file}"
		
		if [ ! -f "${target_file}.bak" ]; then
			echo "✅ 备份目标源文件"
			cp -f "$target_file" "${target_file}.bak"
		fi

		if [ -f "${SOURCE_DIR}/bak/${file}" ]; then
			echo "✅ 项目备份文件已存在，跳过备份"
			continue
		fi
		
		echo "✅ 拷贝源备份文件到项目目录"
		cp -f "${target_file}.bak" "${source_file}"


		if [[ "$source_file" == *".js" ]]; then
			
			echo "正在格式化文件，请稍后..."
			prettier --cache "$source_file" > "${source_file}.txt" && {
				echo "✅ 格式化成功"
				mv "${source_file}" "${SOURCE_DIR}/bak"
			}
		else
			cp -f "$source_file" "${SOURCE_DIR}/bak"
		fi

	done <<< "$FILE_NAMES"
}




# 还原workbench中的备份文件
restore_workbench_files() {
	echo "📝 开始批量还原文件..."

	while read -r file; do
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
	done <<< "$FILE_NAMES"
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
