# Function Point analysis
## ILF
| ILF                     | DET | RET  | Complexity                          | Weight |
| ----------------------- | -----------------------: | -------------------: | ----------------------------------- | -----: |
| Users               |                       15 |                    2 | Low  |     7 |
| Groups              |                       10 |                    2 | Low                        |     7 |
| Questions           |                       12 |                    2 | Low                         |     7 |
| Votes          |                        8 |                    2 | Low                         |     7 |
| InvitationCodes     |                        6 |                    1 | Low                             |      7 |
| Results/Leaderboard |                        8 |                    1 | Low                             |      7 |
| **Total ILF = 42 FP**   |                          |                      |                                     |        |
## EIF

| EIF                              | DET | RET | Complexity  | Weight |
| -------------------------------- | --: | --: | ----------- | -----: |
| **Total EIF = 0 FP**            |     |     |             |        |

## EI

| External Input            |               FTR | DET | Complexity (per IFPUG table) | Weight |
| ------------------------- | ----------------------------------------: | --: | ---------------------------- | -----: |
| Registration              |                          2  |   6 | Medium    |      4 |
| Login                     |                                  1  |   4 | Low                      |      3 |
| Update profile            |                                         1 |   8 | Low                      |      3 |
| Create group              |                        2 |   6 | Medium                      |      4 |
| Join by code              | 3|   6 | Medium                      |      6 |
| Create question           |                    2|   6 | Medium                      |      4 |
| Vote                      |                     2 |   5 | Medium                      |      4 |
| **Total EI = 28 FP**      |                                           |     |                              |        |
## EO
| EO                             | FTR | DET | Complexity            | Weight |
| ------------------------------ | --: | --: | --------------------- | -----: |
| Generate leaderboard           |   2 |   7 | Medium               |      5 |
| **Total EO = 5 FP**           |     |     |                       |        |

## EQ
| EQ                    | FTR | DET | Complexity | Weight |
| --------------------- | --: | --: | ---------- | -----: |
| Get user profile      |   1 |   5 | Low        |      3 |
| List user groups      |   1 |   5 | Low    |      3 |
| Get group members     |   1 |   5 | Low    |      3 |
| Check active question |   1 |   4 | Low    |      3 |
| **Total EQ = 18 FP**  |     |     |            |        |

**Total UFP = ILF (42) + EIF (0) + EI (28) + EO (5) + EQ (12) = 86**\
Assuming the VAF to be 1.00, $\Rightarrow$ **AFP = UFP × VAF = 86 × 1.00 = 101 FP**

## LOC
Coefficient LOC/FP for the technologies used: 

let's assume two third of the code is frontend: 
React+TypeScript: 30–40 LOC/FP (UI + API calls). 

One third of the code is Backened:
Node/Express (TS): 30-45 LOC/FP (routing, service, validation).

FE 58 FP × 30 = 1.7k\
BE 28 FP × 30 ≈ 0.8k\
**Total ≈ 2.5KLOC**

# COCOCMO II

## COCOMO II Results (Post-Architecture Model)

- **Size estimate:** ~2.5 KLOC   
- **Constants:**  
  - A = 2.94  
  - B = 0.91  
  - C = 3.67  
  - D = 0.28  

- **Scale Factors (ΣSF):** ≈ 17.7  
- **Exponent (E):** 0.91 + 0.01 × 17.7 ≈ **1.087**  
- **Effort Multipliers (ΠEM):** ≈ 1.0 (nominal case)  

### Effort (Person-Months)
$
PM = A \times Size^E \times \prod EM
$  
$
PM = 2.94 \times 2.5^{1.087} \times 1.0 ≈ 5 \, \text{PM}
$

**Estimated effort:** ~5 person-months  

---

### Schedule (Time to Develop)
$
TDEV = C \times PM^F
$ 
where  
$
F = D + 0.2 \times (E - B) = 0.28 + 0.2 \times (1.087 - 0.91) ≈ 0.315
$

$
TDEV = 3.67 \times 5^{0.315} ≈ 5.5 \, \text{months}
$

**Estimated schedule:** ~5 months  

---

## Actual Outcome

Despite COCOMO II predicting **4 PM** and a **5-month schedule**, we successfully delivered the project in **4 months** with a **5-person team**.

### How we achieved this:
1. **Full parallelization** of tasks across frontend, backend, and DB.  
2. **Resource optimization**   
3. **Strict scope control** to prevent feature creep and keep the workload stable.  
4. **Efficient collaboration** with clear responsibilities and agile sprints.  





