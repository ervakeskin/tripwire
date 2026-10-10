# Tripwire tehdit modeli

## Varlıklar
| Varlık | Neden önemli |
|---|---|
| Kullanıcının LLM API anahtarı | Kota/para; sızarsa kötüye kullanılır |
| Rapor bütünlüğü (skor + alıntılar) | Kullanıcı karar verirken buna güveniyor |
| Taranan sayfa içeriği | Kullanıcının gezdiği sayfalar; gereksiz yere dışarı gönderilmemeli |

## Güven sınırları
```
Sayfa (GÜVENİLMEZ) ─► content script ─► yan panel ─► background (anahtar burada) ─► LLM sağlayıcısı
                         sanitize            UI         validate + score                (GÜVENİLMEZ çıktı)
```
Sayfa metni de LLM çıktısı da **güvenilmez veri** sayılır; ikisinin arasında deterministik kod (sanitizer, validator, skorlayıcı) durur.

## Saldırılar ve karşılıkları
| # | Saldırı | Etki | Savunma | Kalan risk |
|---|---|---|---|---|
| 1 | Sayfada **gizli** talimat (display:none, ekran dışı, 0px, beyaz-üstü-beyaz, aria-hidden) | Model yönlendirilir | Gizli metin `extractVisibleText` ile ayrılır, LLM'e **hiç gönderilmez**; yalnızca `detectInjection` ile taranıp kullanıcıya uyarı olur | Başka gizleme yöntemleri (CSS `clip`, `::before` içerik, resim içi metin) |
| 2 | **Görünür** metne gömülü "AI'ya not" | Model uyarsa maddeleri gizler / skor düşürür | System prompt: belge veridir; `detectInjection` uyarısı; skoru model değil kod hesaplar | Model kandırılıp boş liste dönerse validator bunu yakalayamaz → UI "skora güvenmeyin" uyarısı (yalnızca sinyal) |
| 3 | Model uydurma/yanlış alıntı üretir | Olmayan bir madde raporlanır | Alıntı kaynak metinde birebir (normalize) aranır; yoksa atılır | Alıntı gerçek ama yorum yanlış olabilir (düşük güven rozeti ile hafifletilir) |
| 4 | Modelin şema dışı/serbest metin çıktısı | Ayrıştırma hatası, enjeksiyon taşıyıcısı | Zorunlu tool çağrısı + Zod; madde bazında doğrulama; serbest metin hata sayılır | — |
| 5 | Sayfanın uzantıya mesaj/DOM ile müdahalesi | Anahtar çalma | Anahtar yalnız `chrome.storage.local`'da ve yalnız background'da okunur; content script'te yok; sayfa uzantı bağlamına erişemez | Kötü niyetli başka uzantılar |
| 6 | Kullanıcı verisinin sızması | Gizlilik | Yalnızca ToS sayfası metni, yalnızca kullanıcının seçtiği sağlayıcıya gider; telemetri yok | Sağlayıcının kendi saklama politikası |
| 7 | Gereksiz yetki | Saldırı yüzeyi | İzinler: `activeTab`, `storage`, `sidePanel`, `scripting`, `declarativeContent`; host izni yalnız desteklenen LLM uçları (tüm-site host izni derleme sırasında manifestten çıkarılır, `wxt.config.ts`) | Content script yalnızca kullanıcı taradığında, o sekmeye enjekte edilir (`registration: runtime`) |
| 8 | Bağımlılık riski | Tedarik zinciri | `@page-agent/page-controller` yalnızca **okuma** için kullanılır; `click/input/executeJavascript` çağrılmaz. Pakette doğrudan `eval` bulunur (build uyarısı verir) | Paket güncellemesiyle davranış değişimi → sürüm sabitlenir |

## Test karşılıkları
`test/injection.test.ts` (1, 2, 3), `test/core.test.ts` (3, 4), `test/llm.test.ts` (4), `eval/injection-live.ts` (gerçek model ile 2).

## Bilinen sınırlar (dürüst liste)
- Skor yalnızca *doğrulanmış* maddelerden hesaplanır; model bir riski hiç bulmazsa skor düşük kalır. "0 = güvenli" değildir; UI bunu söyler.
- Heuristik enjeksiyon tespiti yeni kalıpları kaçırabilir.
- Hukuki tavsiye değildir; kategoriler tüketici açısından "dikkat" işaretidir, hukuki değerlendirme değildir.
