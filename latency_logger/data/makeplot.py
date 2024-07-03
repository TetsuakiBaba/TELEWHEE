import sys
import pandas as pd
import matplotlib.pyplot as plt
import itertools


def plot_data(csv_files):
    plt.figure(figsize=(15, 5))

    # カラーマップを作成
    colors = itertools.cycle(plt.rcParams['axes.prop_cycle'].by_key()['color'])

    for csv_file in csv_files:
        # CSVファイルの読み込み
        df = pd.read_csv(csv_file, header=None, names=[
                         'カウント', 'ms', '特記事項'], encoding='utf-8')

        # 次の色を取得
        color = next(colors)

        # プロットの設定
        markersize = 5  # 点の大きさを設定

        # カウントとmsのデータをプロット
        plot_name = csv_file.replace('.csv', '')
        plt.plot(df['カウント'], df['ms'], marker='o', linestyle='-',
                 markersize=markersize, label=f'{plot_name}', color=color)

        # 特記事項があるプロットにラベルを表示（90度半時計回りで回転）
        # for i, row in df.iterrows():
        #     if pd.notna(row['特記事項']):
        #         plt.annotate(row['特記事項'], (row['カウント'], row['ms']),
        #                      textcoords="offset points", xytext=(0, 10), ha='center', fontsize=12, color=color, rotation=90)

    # グラフの設定
    plt.xlabel('count', fontsize=12)
    plt.ylabel('ms', fontsize=12)
    plt.title('Latency log', fontsize=12)
    plt.legend(fontsize=12)
    plt.grid(True)
    plt.ylim(bottom=0)

    # グラフの表示
    plt.show()


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python makeplot.py <csv_file1> <csv_file2> ...")
    else:
        csv_files = sys.argv[1:]
        plot_data(csv_files)
