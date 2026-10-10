# Eval raporu

Model: gemini-3.1-flash-lite · Prompt: v2 · Belge sayısı: 6

**Yakalanan (TP): 23 · Kaçırılan (FN): 6 · Yanlış alarm adayı (FP): 53**
**Recall: 79% · Precision (gold'a göre, alt sınır): 30%**
Validator tarafından atılan (metinde olmayan alıntı) iddia: 4/82

**Elle incelenen fazla maddeler: 23 gerçek risk (gold eksik) · 24 sınırda · 6 gürültü/yanlış alarm · 0 incelenmedi**
**Düzeltilmiş precision (gerçek risk + sınırda yarım): 76%**

> Gold etiketler elle ve eksiksiz değildir; "fazla" maddeler tek tek incelenip aşağıdaki Hata Analizi bölümüne işlenmelidir.

## spotify (53975 chars, score 77, coverage 100%)
- Yakalanan: 5/7 · Kaçırılan: 2 · Yanlış alarm adayı: 13 · Doğrulamada atılan uydurma alıntı: 1
  - KAÇIRILAN [liability_cap] "IN NO EVENT WILL SPOTIFY, ITS OFFICERS, SHAREHOLDERS…"
  - KAÇIRILAN [cancellation_friction] "Spotify will not refund any amounts…"
  - FAZLA [auto_renewal] (high) → valid "Unless otherwise indicated (for example, if you have signed up for a Prepaid Period), Paid…"
  - FAZLA [unilateral_change] (high) → borderline "Price changes will take effect at the start of the next subscription period following the …"
  - FAZLA [cancellation_friction] (high) → valid "Unless otherwise required by law, we do not provide refunds or credits for any partial sub…"
  - FAZLA [account_termination] (high) → borderline "Spotify may reclaim, or require you to change, your username for any reason.…"
  - FAZLA [account_termination] (high) → borderline "Spotify may terminate these Terms (including any additional terms and conditions incorpora…"
  - FAZLA [other] (high) → borderline "You also grant to us the right (1) to allow the Spotify Service to use the processor, band…"
  - FAZLA [other] (high) → valid "ANY CLAIM ARISING UNDER THESE TERMS MUST BE COMMENCED (BY FILING A DEMAND OR FILING AN IND…"
  - FAZLA [other] (high) → borderline "You agree to indemnify and hold Spotify harmless from and against all damages, losses, and…"
  - FAZLA [arbitration_waiver] (high) → valid "YOU AND SPOTIFY AGREE THAT EACH MAY BRING CLAIMS AGAINST THE OTHER IN ARBITRATION OR LITIG…"
  - FAZLA [arbitration_waiver] (high) → noise "Any arbitration between you and Spotify will be administered by National Arbitration and M…"
  - FAZLA [arbitration_waiver] (high) → borderline "If twenty-five (25) or more claimants submit Notices or attempt to file Demands raising si…"
  - FAZLA [arbitration_waiver] (high) → valid "To the fullest extent permitted by applicable law, each party may bring a Dispute against …"
  - FAZLA [unilateral_change] (high) → valid "We may make changes to these Terms (including any additional Spotify terms and conditions …"

## dropbox (25330 chars, score 66, coverage 100%)
- Yakalanan: 5/6 · Kaçırılan: 1 · Yanlış alarm adayı: 4 · Doğrulamada atılan uydurma alıntı: 1
  - KAÇIRILAN [cancellation_friction] "Dropbox does not provide refunds if we suspend or terminate your access to the Services…"
  - FAZLA [cancellation_friction] (high) → valid "Refunds are only issued if required by law . For example, users living in the European Uni…"
  - FAZLA [account_termination] (high) → borderline "If you don’t pay for your Paid Account on time, we reserve the right to suspend it or remo…"
  - FAZLA [account_termination] (high) → valid "We won’t provide notice or an opportunity to export Your Stuff before termination or suspe…"
  - FAZLA [other] (high) → borderline "Please note that Dropbox Team accounts are subject to your organization's control. Your ad…"

## reddit (83819 chars, score 57, coverage 100%)
- Yakalanan: 3/3 · Kaçırılan: 0 · Yanlış alarm adayı: 8 · Doğrulamada atılan uydurma alıntı: 2
  - FAZLA [account_termination] (high) → borderline "hough we have no obligation to screen, edit, or monitor Your Content, we may, in our sole …"
  - FAZLA [account_termination] (high) → noise "reserve the right to revoke or limit a user’s ability to moderate at any time and for any …"
  - FAZLA [other] (high) → borderline " agree to defend, indemnify, and hold Reddit, its affiliates, and their respective, direct…"
  - FAZLA [unilateral_change] (high) → valid "may make changes to these Terms from time to time. If we make changes, we will post the re…"
  - FAZLA [account_termination] (high) → valid "the fullest extent permitted by applicable law, we may suspend or terminate your Account, …"
  - FAZLA [account_termination] (high) → borderline "ever, we may, in our sole discretion, delete, deem your content ineligible for monetizatio…"
  - FAZLA [liability_cap] (high) → valid "using the Services you agree that the Reddit Entities’ liability is limited to the maximum…"
  - FAZLA [other] (high) → borderline " agree to defend, indemnify, and hold Reddit, its affiliates, and their respective directo…"

## grammarly (56843 chars, score 83, coverage 100%)
- Yakalanan: 6/7 · Kaçırılan: 1 · Yanlış alarm adayı: 16 · Doğrulamada atılan uydurma alıntı: 0
  - KAÇIRILAN [account_termination] "We may terminate these Terms at any time without liability to you…"
  - FAZLA [unilateral_change] (high) → valid "Subject to Section 12.8 below, we may make changes to these Terms at our discretion. If we…"
  - FAZLA [account_termination] (high) → noise "Please note that once you delete your Account, you will not be able to reactivate it or re…"
  - FAZLA [unilateral_change] (high) → borderline "We may modify or discontinue any feature, functionality, or component of our Services at a…"
  - FAZLA [other] (high) → borderline "If you provide us with any suggestions, enhancement requests, recommendations, or other fe…"
  - FAZLA [cancellation_friction] (high) → borderline "Any additional generative AI capacity or units that you purchase (i) will be tied to your …"
  - FAZLA [liability_cap] (high) → valid "You acknowledge and agree that Superhuman is not responsible for any harms, damages, loss,…"
  - FAZLA [liability_cap] (high) → valid "NOTWITHSTANDING ANYTHING ELSE STATED IN THESE TERMS, SUPERHUMAN WILL HAVE NO LIABILITY ARI…"
  - FAZLA [auto_renewal] (high) → valid "For Paid Subscriptions, we will bill you in advance on a recurring monthly or annual basis…"
  - FAZLA [account_termination] (high) → borderline "Superhuman will not have any liability whatsoever to you for any suspension or termination…"
  - FAZLA [unilateral_change] (high) → borderline "We may terminate these Terms at any time without liability to you.…"
  - FAZLA [liability_cap] (high) → valid "IN NO EVENT WILL SUPERHUMAN AND THE SUPERHUMAN ENTITIES’ BE LIABLE TO YOU OR OTHERWISE RES…"
  - FAZLA [arbitration_waiver] (high) → valid "But if we can’t work it out, then you and Superhuman agree to submit our disputes exclusiv…"
  - FAZLA [arbitration_waiver] (high) → borderline "The arbitrator will have exclusive authority to resolve any Dispute, including, without li…"
  - FAZLA [unilateral_change] (high) → valid "Otherwise, you’ll be bound by the change, and the modified Arbitration Agreement will appl…"
  - FAZLA [other] (high) → noise "In the event that the email address you provide to Superhuman is not valid, or for any rea…"
  - FAZLA [account_termination] (high) → valid "We may also at our sole discretion limit access to the Services and/or terminate any subsc…"

## linkedin (32062 chars, score 59, coverage 100%)
- Yakalanan: 3/4 · Kaçırılan: 1 · Yanlış alarm adayı: 8 · Doğrulamada atılan uydurma alıntı: 0
  - KAÇIRILAN [cancellation_friction] "To avoid future charges, cancel before the renewal date…"
  - FAZLA [unilateral_change] (high) → valid "However, we may not always provide prior notice of changes to these terms (1) when those c…"
  - FAZLA [auto_renewal] (high) → valid "If you purchase a subscription, your payment method automatically will be charged at the s…"
  - FAZLA [unilateral_change] (high) → borderline "We may modify our prices effective prospectively upon reasonable notice to the extent allo…"
  - FAZLA [other] (high) → borderline "You agree that we have no obligation to store, maintain or provide you a copy of any conte…"
  - FAZLA [other] (high) → borderline "By submitting suggestions or other feedback regarding our Services to LinkedIn, you agree …"
  - FAZLA [account_termination] (high) → noise "LinkedIn reserves the right to restrict, suspend, or terminate your account if you breach …"
  - FAZLA [unilateral_change] (high) → borderline "LinkedIn reserves the right to limit your use of the Services, including the number of you…"
  - FAZLA [account_termination] (high) → noise "Both you and LinkedIn may terminate this Contract at any time with notice to the other. On…"

## slack (13099 chars, score 39, coverage 100%)
- Yakalanan: 1/2 · Kaçırılan: 1 · Yanlış alarm adayı: 4 · Doğrulamada atılan uydurma alıntı: 0
  - KAÇIRILAN [unilateral_change] "we may change these User Terms or the Acceptable Use Policy…"
  - FAZLA [unilateral_change] (high) → valid "If you access or use the Services, or continue accessing or using the Services after being…"
  - FAZLA [liability_cap] (high) → borderline "SLACK MAKES NO REPRESENTATIONS OR WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, TO Y…"
  - FAZLA [account_termination] (high) → borderline "We may directly step in and take what we determine to be appropriate action (including dis…"
  - FAZLA [unilateral_change] (high) → valid "If you use the Services after the effective date of any changes, that use will constitute …"
