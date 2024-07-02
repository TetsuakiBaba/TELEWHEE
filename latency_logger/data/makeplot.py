import sys
import pandas as pd
import matplotlib.pyplot as plt


def plot_data(csv_files):
    plt.figure(figsize=(10, 6))

    for csv_file in csv_files:
        # CSVファイルの読み込み
        df = pd.read_csv(csv_file, header=None, names=[
                         'カウント', 'ms', '特記事項'], encoding='utf-8')

        # プロットの設定
        markersize = 5  # 点の大きさを設定

        # カウントとmsのデータをプロット
        plt.plot(df['カウント'], df['ms'], marker='o', linestyle='-',
                 markersize=markersize, label=f'{csv_file} - Latency(ms)')

        # 特記事項があるプロットにラベルを表示（90度半時計回りで回転）
        for i, row in df.iterrows():
            if pd.notna(row['特記事項']):
                plt.annotate(row['特記事項'], (row['カウント'], row['ms']),
                             textcoords="offset points", xytext=(0, 10), ha='center', fontsize=9, color='red', rotation=90)

    # グラフの設定
    plt.xlabel('count')
    plt.ylabel('ms')
    plt.title('Latency log')
    plt.legend()
    plt.grid(True)
    plt.ylim(bottom=0, top=100)

    # グラフの表示
    plt.show()


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python makeplot.py <csv_file1> <csv_file2> ...")
    else:
        csv_files = sys.argv[1:]
        plot_data(csv_files)
