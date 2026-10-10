# Eval raporu

Model: qwen/qwen3.8-27b · Prompt: v2 · Belge sayısı: 6

**Yakalanan (TP): 25 · Kaçırılan (FN): 4 · Yanlış alarm adayı (FP): 75**
**Recall: 86% · Precision (gold'a göre, alt sınır): 25%**
Validator tarafından atılan (metinde olmayan alıntı) iddia: 4/109

**Elle incelenen fazla maddeler: 26 gerçek risk (gold eksik) · 36 sınırda · 13 gürültü/yanlış alarm · 0 incelenmedi**
**Düzeltilmiş precision (gerçek risk + sınırda yarım): 69%**

> Gold etiketler elle ve eksiksiz değildir; "fazla" maddeler tek tek incelenip aşağıdaki Hata Analizi bölümüne işlenmelidir.

## spotify (53975 chars, score 82, coverage 100%)
- Yakalanan: 6/7 · Kaçırılan: 1 · Yanlış alarm adayı: 18 · Doğrulamada atılan uydurma alıntı: 0
  - KAÇIRILAN [liability_cap] "IN NO EVENT WILL SPOTIFY, ITS OFFICERS, SHAREHOLDERS…"
  - FAZLA [liability_cap] (high) → borderline "Spotify has no liability to you, nor any obligation to provide a refund to you, in connect…"
  - FAZLA [unilateral_change] (high) → borderline "Price changes will take effect at the start of the next subscription period following the …"
  - FAZLA [cancellation_friction] (high) → noise "Unless otherwise indicated, cancellation will take effect from the end of the billing peri…"
  - FAZLA [account_termination] (medium) → borderline "Spotify may reclaim, or require you to change, your username for any reason.…"
  - FAZLA [account_termination] (high) → borderline "Spotify reserves the right to remove or disable access to any User Content for any or no r…"
  - FAZLA [other] (medium) → borderline "You also grant to us the right (1) to allow the Spotify Service to use the processor, band…"
  - FAZLA [liability_cap] (high) → valid "AGGREGATE LIABILITY FOR ALL CLAIMS RELATING TO THE SPOTIFY SERVICE, THIRD-PARTY APPLICATIO…"
  - FAZLA [liability_cap] (high) → valid "YOU AGREE THAT YOUR SOLE AND EXCLUSIVE REMEDY FOR ANY PROBLEMS OR DISSATISFACTION WITH THE…"
  - FAZLA [arbitration_waiver] (high) → valid "ANY CLAIM ARISING UNDER THESE TERMS MUST BE COMMENCED (BY FILING A DEMAND OR FILING AN IND…"
  - FAZLA [other] (high) → borderline "You agree to indemnify and hold Spotify harmless from and against all damages, losses, and…"
  - FAZLA [arbitration_waiver] (high) → valid "YOU AND SPOTIFY AGREE THAT EACH MAY BRING CLAIMS AGAINST THE OTHER IN ARBITRATION OR LITIG…"
  - FAZLA [arbitration_waiver] (high) → borderline "Either you or Spotify may start arbitration proceedings. Any arbitration between you and S…"
  - FAZLA [arbitration_waiver] (high) → borderline "If twenty-five (25) or more claimants submit Notices or attempt to file Demands raising si…"
  - FAZLA [arbitration_waiver] (high) → valid "To the fullest extent permitted by applicable law, each party may bring a Dispute against …"
  - FAZLA [arbitration_waiver] (high) → noise "You may opt out of arbitration by providing an individual, personally signed notice of you…"
  - FAZLA [unilateral_change] (high) → valid "We may make changes to these Terms (including any additional Spotify terms and conditions …"
  - FAZLA [arbitration_waiver] (high) → borderline "Even if you opt out of a material change to the Arbitration Agreement, you and Spotify agr…"
  - FAZLA [cancellation_friction] (medium) → valid "Premium Subscribers who do not wish to continue using the Spotify Service under the update…"

## dropbox (25330 chars, score 74, coverage 100%)
- Yakalanan: 6/6 · Kaçırılan: 0 · Yanlış alarm adayı: 7 · Doğrulamada atılan uydurma alıntı: 0
  - FAZLA [content_license] (medium) → valid "To provide these and other features, Dropbox accesses, stores, and scans Your Stuff. You g…"
  - FAZLA [cancellation_friction] (high) → valid "Refunds are only issued if required by law . For example, users living in the European Uni…"
  - FAZLA [unilateral_change] (high) → borderline "However, these free features may be withdrawn without further notice.…"
  - FAZLA [account_termination] (high) → valid "We won’t provide notice or an opportunity to export Your Stuff before termination or suspe…"
  - FAZLA [liability_cap] (high) → valid "IN COUNTRIES WHERE EXCLUSIONS OR LIMITATIONS OF LIABILITY ARE ALLOWED, DROPBOX, ITS AFFILI…"
  - FAZLA [arbitration_waiver] (high) → noise "You can decline this agreement to arbitrate by clicking here and submitting the opt-out fo…"
  - FAZLA [unilateral_change] (high) → borderline "If you don’t agree to the updates we make, please cancel your account and stop using the S…"

## reddit (83819 chars, score 61, coverage 100%)
- Yakalanan: 3/3 · Kaçırılan: 0 · Yanlış alarm adayı: 10 · Doğrulamada atılan uydurma alıntı: 2
  - FAZLA [account_termination] (high) → borderline "hough we have no obligation to screen, edit, or monitor Your Content, we may, in our sole …"
  - FAZLA [tracking] (medium) → noise " type, degree, and targeting of advertisements are subject to change, and you acknowledge …"
  - FAZLA [other] (high) → borderline " agree to defend, indemnify, and hold Reddit, its affiliates, and their respective, direct…"
  - FAZLA [unilateral_change] (high) → valid "may make changes to these Terms from time to time. If we make changes, we will post the re…"
  - FAZLA [account_termination] (high) → valid "the fullest extent permitted by applicable law, we may suspend or terminate your Account, …"
  - FAZLA [content_license] (high) → valid " also agree that we may remove metadata associated with Your Content, and you irrevocably …"
  - FAZLA [account_termination] (high) → borderline "may, in our sole discretion, delete, deem your content ineligible for monetization, or rem…"
  - FAZLA [other] (medium) → borderline " agree that Reddit may use such ideas, suggestions, and feedback without compensation or o…"
  - FAZLA [liability_cap] (high) → valid "using the Services you agree that the Reddit Entities’ liability is limited to the maximum…"
  - FAZLA [other] (high) → borderline " agree to defend, indemnify, and hold Reddit, its affiliates, and their respective directo…"

## grammarly (56843 chars, score 85, coverage 100%)
- Yakalanan: 7/7 · Kaçırılan: 0 · Yanlış alarm adayı: 22 · Doğrulamada atılan uydurma alıntı: 2
  - FAZLA [account_termination] (high) → noise "Please note that once you delete your Account, you will not be able to reactivate it or re…"
  - FAZLA [account_termination] (medium) → borderline "you acknowledge that the Organization may access, view, restrict, merge, or terminate your…"
  - FAZLA [unilateral_change] (high) → borderline "We may modify or discontinue any feature, functionality, or component of our Services at a…"
  - FAZLA [cancellation_friction] (high) → borderline "Any additional generative AI capacity or units that you purchase (i) will be tied to your …"
  - FAZLA [tracking] (medium) → borderline "We may also collect and analyze data relating to your access and use of our Services (“ Us…"
  - FAZLA [liability_cap] (high) → valid "NOTWITHSTANDING ANYTHING ELSE STATED IN THESE TERMS, SUPERHUMAN WILL HAVE NO LIABILITY ARI…"
  - FAZLA [account_termination] (high) → noise "We may, in our sole discretion, change the functionality of the Beta Services and/or disco…"
  - FAZLA [auto_renewal] (high) → valid "For Paid Subscriptions, we will bill you in advance on a recurring monthly or annual basis…"
  - FAZLA [account_termination] (high) → noise "Upon termination of the Services or the applicable feature or functionality thereof, your …"
  - FAZLA [liability_cap] (high) → borderline "We may terminate these Terms at any time without liability to you.…"
  - FAZLA [liability_cap] (high) → valid "IN NO EVENT WILL SUPERHUMAN AND THE SUPERHUMAN ENTITIES’ BE LIABLE TO YOU OR OTHERWISE RES…"
  - FAZLA [other] (high) → borderline "SUPERHUMAN AND THE SUPERHUMAN ENTITIES DO NOT MAKE ANY REPRESENTATION OR WARRANTY REGARDIN…"
  - FAZLA [arbitration_waiver] (high) → valid "you and Superhuman agree to submit our disputes exclusively to binding individual arbitrat…"
  - FAZLA [arbitration_waiver] (high) → valid "You and Superhuman agree that each of us may bring claims against the other only on an ind…"
  - FAZLA [arbitration_waiver] (high) → borderline "if the amount in dispute is less than $25,000, the arbitration will be conducted as a docu…"
  - FAZLA [arbitration_waiver] (high) → borderline "The arbitrator will have exclusive authority to resolve any Dispute, including, without li…"
  - FAZLA [arbitration_waiver] (high) → borderline "Except as provided in Section 12.6 (Batch Arbitration), the arbitrator can award damages a…"
  - FAZLA [unilateral_change] (high) → valid "Otherwise, you’ll be bound by the change, and the modified Arbitration Agreement will appl…"
  - FAZLA [arbitration_waiver] (high) → borderline "For clarity, this Section 12.9 will continue to apply even if you validly opt out of arbit…"
  - FAZLA [liability_cap] (medium) → noise "We will not be liable by reason of any failure or delay in the performance of our obligati…"
  - FAZLA [account_termination] (high) → valid "We may also at our sole discretion limit access to the Services and/or terminate any subsc…"
  - FAZLA [unilateral_change] (medium) → noise "You consent to such automatic updating on your mobile device, and agree that the Agreement…"

## linkedin (32062 chars, score 62, coverage 100%)
- Yakalanan: 2/4 · Kaçırılan: 2 · Yanlış alarm adayı: 13 · Doğrulamada atılan uydurma alıntı: 0
  - KAÇIRILAN [unilateral_change] "We may change, suspend or discontinue any of our Services…"
  - KAÇIRILAN [cancellation_friction] "To avoid future charges, cancel before the renewal date…"
  - FAZLA [unilateral_change] (high) → valid "We may modify this Contract, our Privacy Policy and our Cookie Policy from time to time. I…"
  - FAZLA [auto_renewal] (high) → valid "If you purchase a subscription, your payment method automatically will be charged at the s…"
  - FAZLA [unilateral_change] (high) → borderline "We may modify our prices effective prospectively upon reasonable notice to the extent allo…"
  - FAZLA [account_termination] (medium) → borderline "To the extent that laws allow this, we are not obligated to publish any content or other i…"
  - FAZLA [content_license] (high) → borderline "While we may edit and make format changes to your content (such as translating or transcri…"
  - FAZLA [content_license] (high) → borderline "By submitting suggestions or other feedback regarding our Services to LinkedIn, you agree …"
  - FAZLA [account_termination] (high) → borderline "We may change, suspend or discontinue any of our Services. We may also limit the availabil…"
  - FAZLA [account_termination] (high) → borderline "We don’t promise to store or show (or keep showing) any information (including content) th…"
  - FAZLA [account_termination] (high) → noise "LinkedIn reserves the right to restrict, suspend, or terminate your account if you breach …"
  - FAZLA [tracking] (medium) → borderline "We use the data and other information that you provide and that we have about Members and …"
  - FAZLA [account_termination] (high) → noise "Both you and LinkedIn may terminate this Contract at any time with notice to the other. On…"
  - FAZLA [other] (high) → noise "You and LinkedIn agree that the laws of the State of California, U.S.A., excluding its con…"
  - FAZLA [account_termination] (medium) → borderline "To the extent we can under law, we may remove or restrict access to content, features, ser…"

## slack (13099 chars, score 39, coverage 100%)
- Yakalanan: 1/2 · Kaçırılan: 1 · Yanlış alarm adayı: 5 · Doğrulamada atılan uydurma alıntı: 0
  - KAÇIRILAN [unilateral_change] "we may change these User Terms or the Acceptable Use Policy…"
  - FAZLA [unilateral_change] (high) → valid "If you access or use the Services, or continue accessing or using the Services after being…"
  - FAZLA [liability_cap] (high) → borderline "SLACK MAKES NO REPRESENTATIONS OR WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, TO Y…"
  - FAZLA [account_termination] (medium) → noise "These User Terms remain effective until Customer’s subscription for you expires or termina…"
  - FAZLA [unilateral_change] (high) → valid "If you use the Services after the effective date of any changes, that use will constitute …"
  - FAZLA [account_termination] (medium) → borderline "We may directly step in and take what we determine to be appropriate action (including dis…"
