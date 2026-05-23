#!/bin/bash

base_dir="$(cd "$(dirname "$0")" && pwd)"
code_dir="${base_dir}/code"


app_name="Trae CN"
# [[ "$base_dir" == *".trae-cn" ]] && app_name="Trae CN"
[[ "$base_dir" == *".vscode" ]] && app_name="Visual Studio Code"

app_dir="/Applications/${app_name}.app/Contents/Resources/app"
main_file="${app_dir}/out/main.js"
workbench_dir="${app_dir}/out/vs/workbench"
echo "应用名称: ${app_name}"

# 避免无法正确的格式化，所以需要切换到项目目录
cd "$base_dir"


# 检查是否安装了prettier
if command -v prettier &> /dev/null; then
	is_prettier=true
else
	is_prettier=false
	echo "prettier 未安装, 无法格式化"
fi



# 查找所有非备份文件
find_files=$(find "$workbench_dir" -maxdepth 1 -type f ! -name "*.bak")
if [ -z "$find_files" ]; then
	echo "❌ 目标目录中没有文件"
	exit 1
fi

find_files+=$'\n'"${main_file}"



# 清空项目目录
rm -rf "$code_dir"
mkdir -p "$code_dir"



# 遍历所有文件
while read -r file; do
	bak_file="${file}.bak"
	fileName=$(basename "$file")
	name="${fileName%.*}"
	ext="${fileName##*.}"
	fmt_file="${code_dir}/${name}.fmt.${ext}"
	code_file="${code_dir}/${fileName}"

	# 备份文件不存在时，备份目标源文件
	[ ! -f "$bak_file" ] && cp -f "$file" "$bak_file"

	# 拷贝备份文件到项目目录
	cp -f "$bak_file" "${code_file}"

	# 格式化js文件
	if [[ "$ext" == "js" ]]; then
		if [ "$is_prettier" = true ]; then
			echo "正在格式化文件: ${fileName}"
			prettier --cache "$code_file" > "$fmt_file" &
		fi
		
	fi


done <<<"$find_files"


if [ "$is_prettier" = true ]; then
	wait
	echo "✅ 所有文件格式化完成"
fi

