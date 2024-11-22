from PIL import Image
import os
import re
from typing import Optional, Tuple
from collections import Counter

def get_border_color(img: Image.Image, threshold_percentage: float = 0.7) -> Optional[Tuple[int, int, int]]:
    """
    获取图片边缘的主要颜色
    如果某个颜色占边缘像素的比例超过threshold_percentage，则返回该颜色
    否则返回None
    """
    width, height = img.size
    border_pixels = []
    
    # 转换图片为RGB模式以确保颜色格式一致
    if img.mode != 'RGB':
        img = img.convert('RGB')
    
    # 获取所有边缘像素
    for x in range(width):
        border_pixels.append(img.getpixel((x, 0)))  # 顶边
        border_pixels.append(img.getpixel((x, height-1)))  # 底边
    
    for y in range(height):
        border_pixels.append(img.getpixel((0, y)))  # 左边
        border_pixels.append(img.getpixel((width-1, y)))  # 右边
    
    # 统计颜色出现次数
    color_counts = Counter(border_pixels)
    total_pixels = len(border_pixels)
    
    # 找出出现最多的颜色
    most_common_color, count = color_counts.most_common(1)[0]
    if count / total_pixels >= threshold_percentage:
        return most_common_color
    
    return None

def is_similar_color(color1: Tuple[int, int, int], color2: Tuple[int, int, int], threshold: int = 30) -> bool:
    """
    判断两个颜色是否相似
    """
    return all(abs(c1 - c2) <= threshold for c1, c2 in zip(color1, color2))

def convert_bmp_to_png():
    sprite_dir = "src/assets/sprite"
    processed_count = 0
    background_removed_count = 0
    
    # 首先统计需要处理的文件总数
    bmp_files = [f for f in os.listdir(sprite_dir) if f.lower().endswith('.bmp')]
    total_files = len(bmp_files)
    
    print(f"Found {total_files} BMP files to process")
    
    for index, filename in enumerate(bmp_files, 1):
        try:
            print(f"\nProcessing file {index}/{total_files}: {filename}")
            
            bmp_path = os.path.join(sprite_dir, filename)
            png_filename = filename[:-4] + '.png'
            png_path = os.path.join(sprite_dir, png_filename)
            
            print("- Opening image...")
            with Image.open(bmp_path) as img:
                print("- Detecting border color...")
                background_color = get_border_color(img)
                print("- Converting to RGBA...")
                img = img.convert('RGBA')
                
                if background_color is not None:
                    print("- Background color found, processing transparency...")
                    width, height = img.size
                    pixels = img.load()
                    new_img = Image.new('RGBA', img.size)
                    new_pixels = new_img.load()
                    
                    # 处理每个像素
                    for y in range(height):
                        for x in range(width):
                            pixel = pixels[x, y][:3]  # 获取RGB值
                            if is_similar_color(pixel, background_color):
                                new_pixels[x, y] = (255, 255, 255, 0)  # 透明
                            else:
                                new_pixels[x, y] = pixels[x, y]  # 保持原样
                    
                    print(f"- Saving as PNG with transparency: {png_filename}")
                    new_img.save(png_path, 'PNG')
                    background_removed_count += 1
                else:
                    print(f"- Saving as PNG without changes: {png_filename}")
                    img.save(png_path, 'PNG')
                
                print("- Removing original BMP file...")
                os.remove(bmp_path)
                processed_count += 1
                
        except Exception as e:
            print(f"Error processing {filename}: {str(e)}")
            continue

    print(f"\nConversion summary:")
    print(f"Total converted: {processed_count}/{total_files} files")
    print(f"Background removed: {background_removed_count} files")
    print(f"Background preserved: {processed_count - background_removed_count} files")

def update_asset_manager():
    # 更新 assetManager.ts 文件中的引用
    file_path = "src/services/assetManager.ts"
    
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # 更新 ASSET_LIST 中的文件扩展名
    pattern = r"'([^']+)\.bmp'"
    updated_content = re.sub(pattern, r"'\1.png'", content)
    
    with open(file_path, 'w', encoding='utf-8') as file:
        file.write(updated_content)
    
    print("\nUpdated assetManager.ts references")

def main():
    try:
        print("Starting conversion process...")
        
        # 检查目录是否存在
        sprite_dir = "src/assets/sprite"
        if not os.path.exists(sprite_dir):
            print(f"Error: Directory not found: {sprite_dir}")
            print("Please check if the path is correct")
            return
            
        # 检查是否有BMP文件
        bmp_files = [f for f in os.listdir(sprite_dir) if f.lower().endswith('.bmp')]
        total_files = len(bmp_files)
        
        if total_files == 0:
            print("No BMP files found in the directory")
            return
        
        convert_bmp_to_png()
        update_asset_manager()
        print("\nConversion completed successfully!")
    except Exception as e:
        print(f"\nAn error occurred: {str(e)}")

if __name__ == "__main__":
    main()
