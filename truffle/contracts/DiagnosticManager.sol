// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.18;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./DiagnosticToken.sol";
import "./DiagnosticDomain.sol";

/**
 * @title DiagnosticManager
 * @dev The DiagnosticManager contract manages the creation and certification of Diagnostics,
 *      which are digital documents that certify the energy performance of a property.
 *      It also manages the certification of Diagnosticians, who are authorized to create
 *      Diagnostics for a property. This contract extends OpenZeppelin's AccessControl
 *      and Ownable contracts.
 */
contract DiagnosticManager is AccessControl, Ownable, DiagnosticStructs {
    using Counters for Counters.Counter;
    Counters.Counter private _diagnosticIds;
    DiagnosticToken private diagnosticToken;
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    // siret to diagnostician address mapping
    mapping(string => address) public siretToDiagnostician;
    mapping(address => Diagnostician) public diagnosticians;
    mapping(address => PropertyOwner) private propertyOwners;

    /**
     * @dev Constructor function to initialize the DiagnosticToken and set up the default
     *      admin and minter roles.
     * @param _diagnosticToken The address of the DiagnosticToken contract.
     */
    constructor(DiagnosticToken _diagnosticToken) {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, msg.sender);
        diagnosticToken = _diagnosticToken;
    }

    /**
     * @dev Event emitted when a diagnostician is certified.
     * @param diagnosticianAddress The address of the certified diagnostician.
     */
    event DiagnosticianCertified(address diagnosticianAddress);

    /**
     * @dev Event emitted when a verification request is made.
     * @param diagnosticianAddress The address of the diagnostician making the request.
     */
    event AskedVerification(address diagnosticianAddress);

    /**
     * @dev Event emitted when a Diagnostic is created.
     * @param itemId The ID of the newly created Diagnostic.
     * @param diagnosticianAddress The address of the diagnostician who created the Diagnostic.
     * @param tokenURI The URI of the Diagnostic's metadata.
     */
    event DiagnosticCreated(
        uint256 itemId,
        address diagnosticianAddress,
        string tokenURI
    );

    //:::::::::::::::::::::::::GETTERS:::::::::::::::::::::::::\\

    /**
     * @dev Returns information about the caller. If the caller is a diagnostician, their
     *      diagnostician information is returned. If the caller is a property owner,
     *      their property owner information is returned.
     * @return A UserInfo struct containing information about the caller.
     */
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

    /**
     * @dev Returns the Diagnostician struct associated with the given address.
     * @param _addr The address of the Diagnostician.
     * @return The Diagnostician struct associated with the given address
     */
    function getDiagnostician(
        address _addr
    ) external view returns (Diagnostician memory) {
        return diagnosticians[_addr];
    }

    /**
     * @dev Returns the current diagnostic ID count.
     * @return uint256 Current diagnostic ID count.
     */
    function getDiagnosticIds() public view onlyOwner returns (uint256) {
        return _diagnosticIds.current();
    }

    /**
     * @dev Returns the token URI of a diagnostic with the specified token ID.
     * @param tokenId uint256 ID of the diagnostic.
     * @return string The token URI of the diagnostic.
     */
    function getDiagnosticURI(
        uint256 tokenId
    ) public view returns (string memory) {
        return diagnosticToken.tokenURI(tokenId);
    }

    /**
     * @dev Returns the PDF hash of a diagnostic with the specified token ID.
     * @param tokenId uint256 ID of the diagnostic.
     * @return string The PDF hash of the diagnostic.
     */
    function getDiagnosticHash(
        uint256 tokenId
    ) public view returns (string memory) {
        return diagnosticToken.getPDFHash(tokenId);
    }

    /**
     * @dev Modifier that checks if the message sender is a certified diagnostician.
     * If the sender is not certified, the function will revert with a specific error message.
     */
    modifier onlyDiagnosticians() {
        require(
            diagnosticians[msg.sender].isCertified == true,
            "You're not a certified diagnostician"
        );
        _;
    }

    //:::::::::::::::::::::::::FUNCTIONS:::::::::::::::::::::::::\\

    /**
     * @dev Grants the MINTER_ROLE to the contract owner to allow for certifying a diagnostician.
     * @param _addr The address of the diagnostician to be certified.
     * Requirements:
     * - The diagnostician should not be already certified.
     * Emits a {DiagnosticianCertified} event.
     */
    function certifyDiagnostician(address _addr) external onlyOwner {
        require(diagnosticians[_addr].isCertified != true, "Already certified");
        _grantRole(MINTER_ROLE, msg.sender);
        diagnosticians[_addr].isCertified = true;
        emit DiagnosticianCertified(_addr);
    }

    /**
     * @dev Allows a user to request verification as a diagnostician.
     * @param _name The name of the user requesting verification.
     * @param _siret The SIRET number associated with the diagnostician.
     * Requirements:
     * - The requester should not be already a certified diagnostician.
     * Emits an {AskedVerification} event.
     */
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

    /**
     * @dev Creates a new diagnostic NFT.
     * @param _diagnostician The address of the certified diagnostician who created the diagnostic.
     * @param _pdfHash The IPFS hash of the diagnostic report PDF.
     * @param _tokenURI The IPFS hash of the diagnostic NFT metadata.
     * Requirements:
     * - The caller should be a certified diagnostician.
     * Emits a {DiagnosticCreated} event.
     * @return uint256 The ID of the newly created diagnostic NFT.
     */
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
