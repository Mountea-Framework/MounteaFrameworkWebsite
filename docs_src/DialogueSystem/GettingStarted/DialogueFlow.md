---
tags:
  - tutorial
  - dialogue
  - flow
---

# Dialogue Flow

An illustrated overview of how the Mountea Dialogue System processes a conversation at runtime, from initialization through to dialogue completion.

---

```mermaid
flowchart TD;
    A[Initialize Dialogue]-->A1[Failed];
    A[Initialize Dialogue]-->A2[OK];
    A2[OK]-->B[Manager Verify Data];
    B[Manager Verify Data]-->B1[OK];
    B[Manager Verify Data]-->B2[Failed];
    B1[OK]-->C1[Open Dialogue UI];
    B1[OK]-->C2[Evaluate Nodes];
    C2[Evaluate Nodes]-->C2_1[Evaluate Decorators];
    C2_1[Evaluate Decorators]-->C2_2[Filter Available Nodes];
    C2_2[Filter Available Nodes]-->D2[For Each Node];
    D2[For Each Node]-->D1[Execute Decorators];
    D1[Execute Decorators]-->E1[Finish Up Data];
    E1[Finish Up Data]-->D2_1[Execute Node];
    D2_1[Execute Node]-->I1{Requires Input?};
    I1{Requires Input?}-->I1_1[Yes];
    I1{Requires Input?}-->I1_2[No];
    I1_2[No]-->F1[Start Dialogue Row Data];
    I1_1[Yes]-->I1_2_1[Wait for Selection…];
    I1_2_1[Wait for Selection…]-->I1_2_1_1[Node Selected];
    I1_2_1_1[Node Selected]-->F1[Start Dialogue Row Data];
    F1[Start Dialogue Row Data]-->F2[Complete Dialogue Row Data];
    F2[Complete Dialogue Row Data]-->F3{Is Last Row?};
    F3{Is Last Row?}-->H1[Yes];
    F3{Is Last Row?}-->H2[No];
    H2[No]-->H2_1[Get Next Row Data];
    H2_1[Get Next Row Data]-- Next Row Data -->F1;
    H1[Yes]-->H1_1[Complete Node];
    H1_1[Complete Node]-->K1{Is Last Node?};
    K1{Is Last Node?}-->K1_1[Yes];
    K1{Is Last Node?}-->K1_2[No];
    K1_1[Yes]-->L1[Complete Dialogue];
    K1_2[No]-- Next Node -->D2;
    L1[Complete Dialogue]-->L1_1[Close Dialogue UI];
    L1[Complete Dialogue]-->L1_2[Cleanup Decorators];
    L1[Complete Dialogue]-->L1_3[Save Traversal Path];
    L1[Complete Dialogue]-->L1_4[Reset States];

    style A1 stroke:#f66,stroke-width:2px,stroke-dasharray:5 5,color:#fff
    style B2 stroke:#f66,stroke-width:2px,stroke-dasharray:5 5,color:#fff
    style C2 stroke:#ff0,stroke-width:2px,stroke-dasharray:5 5,color:#fff
    style C2_1 stroke:#ff0,stroke-width:2px,stroke-dasharray:5 5,color:#fff
    style D2 stroke:#fff,stroke-width:2px,stroke-dasharray:5 5,color:#fff
    style L1_2 stroke:#ff0,stroke-width:2px,stroke-dasharray:5 5,color:#fff
    style I1 stroke:#515126,stroke-width:2px,color:white,fill:#1f2117
    style K1 stroke:#515126,stroke-width:2px,color:white,fill:#1f2117
    style F3 stroke:#515126,stroke-width:2px,color:white,fill:#1f2117
```