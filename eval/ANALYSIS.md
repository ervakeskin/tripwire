# Eval hata analizi

Veri: 6 gerçek ToS, 29 elle etiketli gold madde. Sonuçlar: `eval/report-*.md`, ham çıktılar: `eval/results/`.
Sınıflandırma (`eval/adjudication.json`) geliştirici-yardımcısı tarafından yapıldı; hukukçu değerlendirmesi değildir, örnekleme ile doğrulanmalıdır.

## 1. Kaçırılan maddeler (gemini-3.1-flash-lite · v2: 6, qwen3.8-27b · v2: 4)

| Belge · gold | Gemini | Qwen | Neden |
|---|---|---|---|
| Spotify · liability_cap ("IN NO EVENT WILL SPOTIFY…") | kaçırdı | kaçırdı | Yakınında hiçbir tahmin yok. **Gerçek kaçırma**; nedeni doğrulanmadı (v2 istemindeki "bölüm başına en fazla 6 madde" sınırı bir aday açıklama, ama test edilmedi). |
| Spotify · cancellation_friction ("will not refund any amounts") | kaçırdı | yakaladı | Gemini bunu `account_termination` olarak etiketledi: **kategori karışması**, madde bulundu. |
| Dropbox · cancellation_friction (iade yok) | kaçırdı | yakaladı | Aynı: `account_termination` olarak etiketlendi. |
| Grammarly · account_termination ("terminate… without liability") | kaçırdı | yakaladı | Gemini `unilateral_change` etiketledi: kategori karışması. |
| LinkedIn · cancellation_friction ("cancel before the renewal date") | kaçırdı | kaçırdı | Yakınında `auto_renewal` tahmini var; yenileme maddesi doğru bulundu, "iptal zorluğu" ayrı madde olarak çıkarılmadı. Gold kategorisi tartışmalı. |
| LinkedIn · unilateral_change ("may change, suspend or discontinue") | yakaladı | kaçırdı | Qwen aynı cümleyi `account_termination` etiketledi: kategori karışması. |
| Slack · unilateral_change ("we may change these User Terms") | kaçırdı | kaçırdı | Yakında tahmin yok. **Gerçek kaçırma** (iki model de); nedeni incelenmedi. |

Özet: 6 (Gemini) kaçırmanın **3'ü kategori karışması**, 1'i tartışmalı gold, 2'si gerçek kaçırma. Qwen'in 4 kaçırmasının 1'i kategori karışması, 1'i tartışmalı gold, 2'si gerçek.
Kategori karışmaları en çok `cancellation_friction ↔ account_termination` ve `unilateral_change ↔ account_termination` arasında: kategori tanımları bitişik. Bu, ürün açısından düşük zararlıdır (madde yine kullanıcıya gösterilir, yalnızca etiketi farklıdır) ama skor ağırlığını etkiler.

## 2. "Fazla" maddeler (gold'da yok)

| Sınıf | Gemini (53) | Qwen (75) | Anlamı |
|---|---|---|---|
| Gerçek risk (gold eksik) | 23 | 26 | Gold seyrek: ör. Spotify'da fiyat/iade/tahkim işleyişi, LinkedIn'de otomatik tahsilat, Grammarly'de sorumluluk istisnaları. Bunlar gerçek tüketici riskidir. |
| Sınırda | 24 | 36 | Tazminat (indemnify), hesap kısıtlama yetkisi, geri bildirim lisansı: tüketici aleyhine ama sözleşmelerde yaygın. |
| Gürültü | 6 | 13 | Tüketici lehine bilgi maddeleri (tahkimden çıkış hakkı), standart hükümler (mücbir sebep, geçerli hukuk), zararsız hesap bilgileri. |

Yani "fazla" maddelerin çoğu hata değil, gold'un eksikliğidir; yine de Qwen belirgin şekilde daha fazla gürültü üretiyor. Sınırda maddeler skorlama sorunudur: bunlar tek başlarına düşük ağırlıklı kalmalı (kategori başına azalan katkı bunu kısmen sağlıyor).

## 3. Alıntı doğrulaması (uydurma yakalama)

| Model | Atılan / toplam iddia |
|---|---|
| gemini-3.1-flash-lite · v2 | 4 / 82 (%5) |
| qwen3.8-27b · v2 | 4 / 109 (%4) |
| qwen3.8-27b · v1 | 11 / 164 (%7) |
| gpt-oss-20b · v2 | 20 / 99 (%20) |

Atılan iddialar raporda "doğrulanamadı" notu olarak görünür. Bu kapı olmasaydı gpt-oss-20b raporlarındaki maddelerin %20'si metinde olmayan alıntılar olurdu.

## 4. Sınırlar
- Gold 29 madde / 6 belge: küçük örneklem, güven aralıkları geniş.
- İstem aynı belgeler üzerinde ayarlandı (v1→v2); bağımsız bir test kümesi yok.
- Eşleşme kuralı (≤400 karakter) sıkı bir "aynı cümle" ölçütünden daha gevşektir; bunun recall'u yükselttiği unutulmamalı.
- Kapsam %100: tüm bölümler analiz edildi; kısmi kapsamlı sonuçlar rapora alınmadı (ilk denemelerde ücretsiz kota nedeniyle düşen bölümler vardı, bunlar silinip yeniden koşuldu).
