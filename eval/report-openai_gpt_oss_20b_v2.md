# Eval raporu

Model: openai/gpt-oss-20b · Prompt: v2 · Belge sayısı: 6

**Yakalanan (TP): 21 · Kaçırılan (FN): 8 · Yanlış alarm adayı (FP): 54**
**Recall: 72% · Precision (gold'a göre, alt sınır): 28%**
Validator tarafından atılan (metinde olmayan alıntı) iddia: 20/99

**Elle incelenen fazla maddeler: 16 gerçek risk (gold eksik) · 11 sınırda · 7 gürültü/yanlış alarm · 20 incelenmedi**
**Düzeltilmiş precision (gerçek risk + sınırda yarım): 57%**

> Gold etiketler elle ve eksiksiz değildir; "fazla" maddeler tek tek incelenip aşağıdaki Hata Analizi bölümüne işlenmelidir.

## spotify (53975 chars, score 73, coverage 100%)
- Yakalanan: 4/7 · Kaçırılan: 3 · Yanlış alarm adayı: 10 · Doğrulamada atılan uydurma alıntı: 7
  - KAÇIRILAN [liability_cap] "IN NO EVENT WILL SPOTIFY, ITS OFFICERS, SHAREHOLDERS…"
  - KAÇIRILAN [content_license] "you hereby grant to Spotify a non-exclusive, transferable, sublicensable, royalty-free, fu…"
  - KAÇIRILAN [cancellation_friction] "Spotify will not refund any amounts…"
  - FAZLA [cancellation_friction] (high) → valid "Unless otherwise required by law, we do not provide refunds or credits for any partial sub…"
  - FAZLA [unilateral_change] (high) → borderline "Spotify may terminate these Terms (including any additional terms and conditions incorpora…"
  - FAZLA [tracking] (medium) → borderline "You also grant to us the right (1) to allow the Spotify Service to use the processor, band…"
  - FAZLA [liability_cap] (high) → valid "AGGREGATE LIABILITY FOR ALL CLAIMS RELATING TO THE SPOTIFY SERVICE, THIRD-PARTY APPLICATIO…"
  - FAZLA [arbitration_waiver] (high) → valid "ANY CLAIM ARISING UNDER THESE TERMS MUST BE COMMENCED (BY FILING A DEMAND OR FILING AN IND…"
  - FAZLA [arbitration_waiver] (high) → valid "YOU AND SPOTIFY AGREE THAT EACH MAY BRING CLAIMS AGAINST THE OTHER IN ARBITRATION OR LITIG…"
  - FAZLA [arbitration_waiver] (high) → noise "You may opt out of arbitration by providing an individual, personally signed notice of you…"
  - FAZLA [arbitration_waiver] (high) → incelenmedi "Assuming the number of remaining cases exceeds two hundred (200), then two hundred (200) c…"
  - FAZLA [arbitration_waiver] (high) → valid "To the fullest extent permitted by applicable law, each party may bring a Dispute against …"
  - FAZLA [arbitration_waiver] (high) → incelenmedi "Opting out of a material change to the Arbitration Agreement is not an opt-out of arbitrat…"

## dropbox (25330 chars, score 67, coverage 100%)
- Yakalanan: 4/6 · Kaçırılan: 2 · Yanlış alarm adayı: 10 · Doğrulamada atılan uydurma alıntı: 2
  - KAÇIRILAN [cancellation_friction] "Dropbox does not provide refunds if we suspend or terminate your access to the Services…"
  - KAÇIRILAN [arbitration_waiver] "YOU ALSO AGREE TO THE FOLLOWING MANDATORY ARBITRATION PROVISIONS…"
  - FAZLA [account_termination] (high) → borderline "If you don’t pay for your Paid Account on time, we reserve the right to suspend it or remo…"
  - FAZLA [account_termination] (high) → incelenmedi "We’ll provide you with reasonable advance notice via the email address associated with you…"
  - FAZLA [account_termination] (high) → valid "We won’t provide notice or an opportunity to export Your Stuff before termination or suspe…"
  - FAZLA [arbitration_waiver] (high) → incelenmedi "Opt out of Agreement to Arbitrate. You can decline this agreement to arbitrate by clicking…"
  - FAZLA [arbitration_waiver] (high) → incelenmedi "Arbitration Fees and Incentives. The AAA rules will govern payment of all arbitration fees…"
  - FAZLA [unilateral_change] (medium) → incelenmedi "Judicial Forum for Disputes. You and Dropbox agree that any judicial proceeding to resolve…"
  - FAZLA [unilateral_change] (medium) → incelenmedi "However, if you agreed to a previous version of these Terms that allowed you to opt out of…"
  - FAZLA [other] (medium) → incelenmedi "The arbitrator may award relief only individually and only to the extent necessary to redr…"
  - FAZLA [unilateral_change] (high) → incelenmedi "If an update affects your use of the Services or your legal rights as a user of our Servic…"
  - FAZLA [cancellation_friction] (medium) → borderline "If you don’t agree to the updates we make, please cancel your account and stop using the S…"

## reddit (83819 chars, score 54, coverage 100%)
- Yakalanan: 3/3 · Kaçırılan: 0 · Yanlış alarm adayı: 4 · Doğrulamada atılan uydurma alıntı: 4
  - FAZLA [unilateral_change] (high) → noise "reserve the right to revoke or limit a user’s ability to moderate at any time and for any …"
  - FAZLA [liability_cap] (high) → valid "using the Services you agree that the Reddit Entities’ liability is limited to the maximum…"
  - FAZLA [account_termination] (high) → incelenmedi "have a policy that includes the removal of any infringing material from the Services and f…"
  - FAZLA [unilateral_change] (high) → valid "may make changes to these Terms from time to time. If we make changes, we will post the re…"

## grammarly (56843 chars, score 84, coverage 100%)
- Yakalanan: 5/7 · Kaçırılan: 2 · Yanlış alarm adayı: 21 · Doğrulamada atılan uydurma alıntı: 6
  - KAÇIRILAN [content_license] "You grant us a worldwide, non-exclusive, royalty-free license to your User Content…"
  - KAÇIRILAN [account_termination] "We may terminate these Terms at any time without liability to you…"
  - FAZLA [unilateral_change] (high) → valid "Subject to Section 12.8 below, we may make changes to these Terms at our discretion. If we…"
  - FAZLA [cancellation_friction] (high) → incelenmedi "If you no longer wish to use our Services and would like to delete your Account, please na…"
  - FAZLA [account_termination] (high) → incelenmedi "We reserve the right to terminate any Credentials that we reasonably determine may have be…"
  - FAZLA [unilateral_change] (high) → borderline "We may modify or discontinue any feature, functionality, or component of our Services at a…"
  - FAZLA [tracking] (high) → borderline "We may also collect and analyze data relating to your access and use of our Services (“ Us…"
  - FAZLA [unilateral_change] (high) → noise "We may, in our sole discretion, change the functionality of the Beta Services and/or disco…"
  - FAZLA [liability_cap] (high) → valid "NOTWITHSTANDING ANYTHING ELSE STATED IN THESE TERMS, SUPERHUMAN WILL HAVE NO LIABILITY ARI…"
  - FAZLA [unilateral_change] (high) → incelenmedi "You acknowledge that Beta Services may not be as secure or reliable as our Services.…"
  - FAZLA [unilateral_change] (high) → incelenmedi "You may choose to use these Beta Services at your sole discretion.…"
  - FAZLA [auto_renewal] (high) → valid "For Paid Subscriptions, we will bill you in advance on a recurring monthly or annual basis…"
  - FAZLA [account_termination] (high) → incelenmedi "We reserve the right to suspend or terminate your access to our Services and/or your Accou…"
  - FAZLA [unilateral_change] (high) → borderline "We may terminate these Terms at any time without liability to you.…"
  - FAZLA [liability_cap] (high) → valid "IN NO EVENT WILL SUPERHUMAN AND THE SUPERHUMAN ENTITIES’ BE LIABLE TO YOU OR OTHERWISE RES…"
  - FAZLA [arbitration_waiver] (high) → valid "you and Superhuman agree to submit our disputes exclusively to binding individual arbitrat…"
  - FAZLA [arbitration_waiver] (high) → incelenmedi "The exception is that we each may (1) bring qualifying individual claims in “small claims”…"
  - FAZLA [arbitration_waiver] (high) → borderline "if the amount in dispute is less than $25,000, the arbitration will be conducted as a docu…"
  - FAZLA [arbitration_waiver] (high) → valid "You and Superhuman agree that each of us may bring claims against the other only on an ind…"
  - FAZLA [arbitration_waiver] (high) → incelenmedi "all Disputes regarding the subsection entitled “Waiver of Class and Other Non-Individualiz…"
  - FAZLA [arbitration_waiver] (high) → incelenmedi "If you are a new user of our Services, you can opt out of this Arbitration Agreement (excl…"
  - FAZLA [other] (low) → incelenmedi "To ensure efficient resolution, if within a 90-day period, 25 or more claimants submit Not…"
  - FAZLA [unilateral_change] (high) → noise "You consent to such automatic updating on your mobile device, and agree that the Agreement…"

## linkedin (32062 chars, score 59, coverage 100%)
- Yakalanan: 3/4 · Kaçırılan: 1 · Yanlış alarm adayı: 7 · Doğrulamada atılan uydurma alıntı: 0
  - KAÇIRILAN [cancellation_friction] "To avoid future charges, cancel before the renewal date…"
  - FAZLA [unilateral_change] (high) → valid "We may modify this Contract, our Privacy Policy and our Cookie Policy from time to time. I…"
  - FAZLA [auto_renewal] (high) → valid "If you purchase a subscription, your payment method automatically will be charged at the s…"
  - FAZLA [unilateral_change] (high) → borderline "We may modify our prices effective prospectively upon reasonable notice to the extent allo…"
  - FAZLA [account_termination] (high) → noise "LinkedIn reserves the right to restrict, suspend, or terminate your account if you breach …"
  - FAZLA [unilateral_change] (high) → borderline "LinkedIn reserves the right to limit your use of the Services, including the number of you…"
  - FAZLA [account_termination] (high) → noise "Both you and LinkedIn may terminate this Contract at any time with notice to the other. On…"
  - FAZLA [unilateral_change] (high) → incelenmedi "However, you agree that LinkedIn may assign this Contract to its affiliates or a party tha…"

## slack (13099 chars, score 30, coverage 100%)
- Yakalanan: 2/2 · Kaçırılan: 0 · Yanlış alarm adayı: 2 · Doğrulamada atılan uydurma alıntı: 1
  - FAZLA [account_termination] (medium) → noise "These User Terms remain effective until Customer’s subscription for you expires or termina…"
  - FAZLA [account_termination] (high) → borderline "We may directly step in and take what we determine to be appropriate action (including dis…"
