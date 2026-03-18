#!/usr/bin/env python3
"""
Version Agent
任务：管理文章版本，记录修改历史
"""

import json
import os
import subprocess
from datetime import datetime

def get_git_info():
    """获取Git信息"""
    try:
        commit_hash = subprocess.check_output(['git', 'rev-parse', '--short', 'HEAD']).decode().strip()
        commit_msg = subprocess.check_output(['git', 'log', '-1', '--pretty=%s']).decode().strip()
        commit_time = subprocess.check_output(['git', 'log', '-1', '--pretty=%ci']).decode().strip()
        return {
            "commit_hash": commit_hash,
            "commit_message": commit_msg,
            "commit_time": commit_time
        }
    except:
        return None

def add_version_header(article_path: str, topic: dict) -> str:
    """为文章添加版本头信息"""
    
    with open(article_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    git_info = get_git_info()
    
    version_header = f"""<!--
版本信息
- 文章标题: {topic.get('title', '无标题')}
- 生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
- 数据来源: {topic.get('source', 'RSS抓取')}
- Git版本: {git_info['commit_hash'] if git_info else 'N/A'}
- 版本说明: {git_info['commit_message'] if git_info else 'N/A'}

修改历史:
- v1.0 ({datetime.now().strftime('%Y-%m-%d')}) - 初始版本
-->

"""
    
    # 检查是否已有版本头
    if content.startswith('<!--'):
        # 替换版本头
        content = re.sub(r'<!--.*?-->', version_header.strip(), content, flags=re.DOTALL, count=1)
    else:
        content = version_header + content
    
    with open(article_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    return article_path

def create_version_backup(package_dir: str) -> str:
    """创建版本备份"""
    backup_dir = os.path.join(package_dir, "versions")
    os.makedirs(backup_dir, exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    version_dir = os.path.join(backup_dir, f"v_{timestamp}")
    os.makedirs(version_dir, exist_ok=True)
    
    # 复制关键文件
    files_to_backup = ["article.md", "final_article.md", "video_script.md"]
    for filename in files_to_backup:
        src = os.path.join(package_dir, filename)
        if os.path.exists(src):
            import shutil
            shutil.copy2(src, version_dir)
    
    # 保存版本信息
    version_info = {
        "version": timestamp,
        "created_at": datetime.now().isoformat(),
        "files": files_to_backup
    }
    
    with open(os.path.join(version_dir, "version.json"), 'w', encoding='utf-8') as f:
        json.dump(version_info, f, ensure_ascii=False, indent=2)
    
    return version_dir

def list_versions(package_dir: str) -> list:
    """列出所有版本"""
    backup_dir = os.path.join(package_dir, "versions")
    if not os.path.exists(backup_dir):
        return []
    
    versions = []
    for dirname in os.listdir(backup_dir):
        if dirname.startswith("v_"):
            version_path = os.path.join(backup_dir, dirname)
            info_path = os.path.join(version_path, "version.json")
            
            if os.path.exists(info_path):
                with open(info_path, 'r', encoding='utf-8') as f:
                    info = json.load(f)
                    versions.append(info)
    
    return sorted(versions, key=lambda x: x["version"], reverse=True)

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        package_dir = sys.argv[1]
        backup_path = create_version_backup(package_dir)
        print(f"✅ 版本备份已创建: {backup_path}")
