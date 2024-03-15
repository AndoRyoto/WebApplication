
# すべてのABCでタイトル，問題文，公式解説をcsvに保存する

import requests
from bs4 import BeautifulSoup
import csv
from time import sleep
import re

num_range = [200,350]
file_name = 'ABC_list.csv'

with open(file_name, 'w', newline='', encoding='utf-8') as file:
    writer = csv.writer(file)
    writer.writerow(['number','level','question','answer'])

    # コンテストを指定
    for num in range(num_range[0],num_range[1]+1):
        q_link_base = 'https://atcoder.jp/contests/abc' + str(num) + '/tasks/abc' + str(num) + '_'
        link = 'https://atcoder.jp/contests/abc' + str(num) + '/editorial?editorialLang=ja'

        try:
            sleep(1)
            response = requests.get(link)
            response.raise_for_status()  # ステータスコードが200でない場合は、エラーを発生させる

            # 解説ページを取得
            soup = BeautifulSoup(response.text, 'html.parser')
            content = soup.find_all('div',class_='col-sm-12')[-1]
            h3 = content.find_all('h3')[1::]
            ul = content.find_all('ul')[1::]
            length = len(h3)

            # 問題リンク，問題の公式解説リンクを取得
            for i in range(length):
                q = h3[i].text
                level = q.split(' - ')[0]
                q_link = q_link_base + level

                try:
                    sleep(1)
                    response = requests.get(q_link)
                    response.raise_for_status()
                    soup = BeautifulSoup(response.text, 'html.parser')
                    q_content = soup.find_all('div', class_='col-sm-12')[-1]
                    q_content = re.sub('\s+', ' ', q_content.text)

                except requests.exceptions.RequestException as e:
                    print(f"URL {q_link} にアクセスできませんでした\n{e}")
                    continue

                a_contents = []
                a_links = []
                for element in ul[i].find_all('li'):

                    if element.find('span').text=='Official':
                        a_link = element.a.get('href')
                        if 'youtube' in a_link:continue
                        a_link = 'https://atcoder.jp' + a_link
                        a_links.append(a_link)
                
                        try:
                            sleep(1)
                            response = requests.get(a_link)
                            response.raise_for_status()
                            soup = BeautifulSoup(response.text, 'html.parser')
                            a_content = soup.find_all('div', class_='col-sm-12')[-1]
                            a_content = re.sub('\s+', ' ', a_content.text)
                            a_contents.append(a_content)

                        except requests.exceptions.RequestException as e:
                            print(f"{a_link} にアクセスできませんでした\n{e}")
                            continue

                # print(num,level,q_content,*a_contents)
                print(f'ABC{num} - {level}')
                writer.writerow([num,level,q_content,*a_contents])
                pass


        # urlが存在しないときは無視
        except requests.exceptions.RequestException as e:
            print(f"URL {link} にアクセスできませんでした\n{e}")
