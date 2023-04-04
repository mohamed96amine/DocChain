// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.18;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./DiagnosticToken.sol";
import "./DiagnosticDomain.sol";

contract DiagnosticManager is AccessControl, Ownable, DiagnosticStructs {
    using Counters for Counters.Counter;
    Counters.Counter private _diagnosticIds;
    DiagnosticToken private diagnosticToken;
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    // siret to diagnostician address mapping
    mapping(string => address) public siretToDiagnostician;
    mapping(address => Diagnostician) public diagnosticians;

    mapping(address => PropertyOwner) private propertyOwners;

    constructor(DiagnosticToken _diagnosticToken) {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, msg.sender);
        diagnosticToken = _diagnosticToken;
    }

    event DiagnosticianCertified(address diagnosticianAddress);
    event AskedVerification(address diagnosticianAddress);
    event DiagnosticCreated(
        uint256 itemId,
        address diagnosticianAddress,
        string tokenURI
    );

    //:::::::::::::::::::::::::GETTERS:::::::::::::::::::::::::\\
    function myself() external view returns (UserInfo memory) {
        Diagnostician memory currentDiagnostician;
        PropertyOwner memory currentPropertyOwner;

        if (bytes(diagnosticians[msg.sender].name).length > 0) {
            currentDiagnostician = diagnosticians[msg.sender];
        } else if (propertyOwners[msg.sender].properties.length > 0) {
            currentPropertyOwner = propertyOwners[msg.sender];
        }
        return
            UserInfo({
                diagnostician: currentDiagnostician,
                propertyOwner: currentPropertyOwner
            });
    }

    function getDiagnostician(
        address _addr
    ) external view returns (Diagnostician memory) {
        return diagnosticians[_addr];
    }

    function getDiagnosticURI(
        uint256 tokenId
    ) public view returns (string memory) {
        return diagnosticToken.tokenURI(tokenId);
    }

    function getDiagnosticHash(
        uint256 tokenId
    ) public view returns (string memory) {
        return diagnosticToken.getPDFHash(tokenId);
    }

    modifier onlyDiagnosticians() {
        require(
            diagnosticians[msg.sender].isCertified == true,
            "You're not a certified diagnostician"
        );
        _;
    }

    //:::::::::::::::::::::::::FUNCTIONS:::::::::::::::::::::::::\\

    function certifyDiagnostician(address _addr) external onlyOwner {
        require(diagnosticians[_addr].isCertified != true, "Already certified");
        _grantRole(MINTER_ROLE, msg.sender);
        diagnosticians[_addr].isCertified = true;
        emit DiagnosticianCertified(_addr);
    }

    function askForVerification(
        string memory _name,
        string memory _siret
    ) external {
        address requester = msg.sender;
        require(
            diagnosticians[requester].isCertified != true,
            "Already certified"
        );
        diagnosticians[requester].name = _name;
        diagnosticians[requester].isCertified = false;
        siretToDiagnostician[_siret] = msg.sender;
        emit AskedVerification(requester);
    }

    function createDiagnostic(
        address _diagnostician,
        string memory _pdfHash,
        string memory _tokenURI
    ) public onlyDiagnosticians returns (uint256) {
        _diagnosticIds.increment();
        uint256 newItemId = _diagnosticIds.current();
        diagnosticToken.mintDiagnostic(_diagnostician, newItemId, _tokenURI);
        diagnosticToken.setPDFHash(newItemId, _pdfHash);
        emit DiagnosticCreated(newItemId, _diagnostician, _tokenURI);
        return newItemId;
    }
}
