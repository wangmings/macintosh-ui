#!/bin/bash

base_dir="$(cd "$(dirname "$0")" && pwd)"
code_dir="${base_dir}/code"
source_dir="${code_dir}/source"

app_name="Trae CN"
# [[ "$base_dir" == *".trae-cn" ]] && app_name="Trae CN"
[[ "$base_dir" == *".vscode" ]] && app_name="Visual Studio Code"

app_dir="/Applications/${app_name}.app/Contents/Resources/app"
main_file="${app_dir}/out/main.js"
workbench_dir="${app_dir}/out/vs/workbench"



# 查找所有非备份文件
find_files=$(find "$workbench_dir" -maxdepth 1 -type f ! -name "*.bak")
if [ -z "$find_files" ]; then
	echo "❌ 目标目录中没有文件"
	exit 1
fi

find_files+=$'\n'"${main_file}"

# 清空项目目录
rm -rf "$code_dir"
mkdir -p "$source_dir"

# 遍历所有文件
while read -r file; do
	
	bak_file="${file}.bak"
	fileName=$(basename "$file")
	code_file="${code_dir}/${fileName}"
	source_file="${source_dir}/${fileName}"

	# 备份文件不存在时，备份目标源文件
	[ ! -f "$bak_file" ] && cp -f "$file" "$bak_file"

	# 拷贝备份文件到项目目录
	cp -f "$bak_file" "${source_file}"

	# 格式化js文件
	if [[ "$source_file" == *".js" ]]; then
		echo "正在格式化文件: ${fileName}"
		prettier --cache "$source_file" >"${code_file}.txt" && {
			mv $source_file "${source_file}.txt"
		} &
	
	else
		# 重新命名文件
		mv $source_file "${source_file}.txt"	
	fi


done <<<"$find_files"


wait

echo "✅ 所有文件格式化完成"
