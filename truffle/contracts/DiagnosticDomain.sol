// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.18;

contract DiagnosticStructs {
    struct Diagnostic {
        string name;
        string diagnosticType;
        Diagnostician madeBy;
    }

    struct Diagnostician {
        string id;
        string name;
        bool isCertified;
    }

    struct Property {
        string id;
        Diagnostic[] diagnostics;
        string typeOfProperty;
    }

    struct PropertyOwner {
        Property[] properties;
    }


    struct UserInfo {
        Diagnostician diagnostician;
        PropertyOwner propertyOwner;
    }
}
