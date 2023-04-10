// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.18;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/draft-ERC721Votes.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./PropertyFactory.sol";

/**
 * @title PropertyManager
 * @author EL BACHRA
 * @dev This contract manages property ownership and diagnostics requests for properties.
It allows property owners to register, certified diagnosticians to create diagnostic reports,
and property factory contracts to create and transfer property ownership. It also includes a
registration fee, and events for property and diagnostic creation, owner and diagnostician
registration and certification, and fund withdrawals.
*/
contract PropertyManager is Ownable {
    /**
     * @dev Diagnostician struct represents a diagnostician in the system.
     * @param name The name of the diagnostician.
     * @param pendingVerification A boolean indicating whether the diagnostician's verification is pending or not.
     * @param isCertified A boolean indicating whether the diagnostician is certified or not.
     * @param price The price of a diagnostic service provided by the diagnostician.
     */
    struct Diagnostician {
        string name;
        bool pendingVerification;
        bool isCertified;
        uint256 price;
    }

    /**
     * @dev DiagnosticRequest struct represents a request for diagnostics made by a property owner.
     * @param propertyOwner The address of the property owner who made the request.
     * @param property The address of the property for which diagnostics were requested.
     * @param isCompleted A boolean indicating whether the diagnostic request has been completed or not.
     */
    struct DiagnosticRequest {
        address propertyOwner;
        address property;
        bool isCompleted;
    }

    struct UserInfo {
        string role;
        bool isCertified;
    }

    //////// FIELDS
    mapping(address => Diagnostician) public verifiedDiagnostician;
    mapping(string => address) public siretToDiagnostician;
    mapping(address => bool) public registeredOwners;
    mapping(address => DiagnosticRequest[]) public diagnosticRequests; //diagnotician => requests to be done

    PropertyFactory private _propertyFactory;
    uint256 public registrationFee;

    //////// CONSTRUCTOR
    /**
     * @notice The constructor initializes the PropertyManager contract with the provided propertyFactoryAddress.
     * @param propertyFactoryAddress The address of the PropertyFactory contract.
     */
    constructor(address propertyFactoryAddress) {
        _propertyFactory = PropertyFactory(propertyFactoryAddress);
    }

    //////// EVENTS
    /**
     * @notice The event emitted when a diagnostic is requested.
     * @param requestId The unique identifier of the diagnostic request.
     * @param propertyOwner The address of the property owner who requested the diagnostic.
     * @param diagnostician The address of the diagnostician assigned to perform the diagnostic.
     * @param propertyAddress The address of the property for which the diagnostic is requested.
     */
    event DiagnosticRequested(
        uint256 requestId,
        address propertyOwner,
        address diagnostician,
        address propertyAddress
    );

    /**
     * @notice The event emitted when a diagnostic is created.
     * @param property The address of the property for which the diagnostic was created.
     * @param tokenId The unique identifier of the created diagnostic.
     */
    event DiagnosticCreated(address indexed property, uint256 indexed tokenId);

    /**
     * @notice The event emitted when a property is created.
     * @param property The address of the created property.
     */
    event PropertyCreated(address indexed property);

    /**
     * @notice The event emitted when a diagnostician asks for verification.
     * @param diagnosticianAddress The address of the diagnostician requesting verification.
     */
    event AskedVerification(address diagnosticianAddress);

    /**
     * @notice The event emitted when a diagnostician is certified.
     * @param diagnosticianAddress The address of the certified diagnostician.
     */
    event DiagnosticianCertified(address diagnosticianAddress);

    /**
     * @notice The event emitted when a diagnostician's certification is revoked.
     * @param diagnosticianAddress The address of the diagnostician whose certification is revoked.
     */
    event DiagnosticianRevoked(address diagnosticianAddress);

    /**
     * @notice The event emitted when a property owner is registered.
     * @param ownerAddress The address of the registered property owner.
     */
    event OwnerRegistered(address ownerAddress);

    /**
     * @notice The event emitted when funds are withdrawn from the contract.
     * @param account The address of the account that withdrew the funds.
     */
    event FundsWithdrawn(address account);

    /**
     * @notice The event emitted when a diagnostic is requested (alternative version with propertyAddress as string).
     * @param requestId The unique identifier of the diagnostic request.
     * @param propertyOwner The address of the property owner who requested the diagnostic.
     * @param propertyAddress The string representation of the property address for which the diagnostic is requested.
     */
    event DiagnosticRequested(
        uint256 requestId,
        address propertyOwner,
        string propertyAddress
    );

    //////// MODIFIERS

    /**
     * @dev Modifier that restricts access to only certified diagnosticians.
     * It checks whether the sender is a certified diagnostician and reverts with an error message if not.
     * If the condition is met, the function execution continues.
     */
    modifier onlyCertifiedDiagnosticians() {
        require(
            verifiedDiagnostician[msg.sender].isCertified == true,
            "You're not a certified diagnostician"
        );
        _;
    }

    /**
     * @dev Modifier that restricts access to only uncertified diagnosticians.
     * It checks whether the sender is not a certified diagnostician and reverts with an error message if the sender is certified.
     * If the condition is met, the function execution continues.
     */
    modifier onlyUnCertifiedDiagnosticians() {
        require(
            verifiedDiagnostician[msg.sender].isCertified == false,
            "You're a certified diagnostician"
        );
        _;
    }

    /**
     * @dev Modifier that restricts access to only registered property owners.
     * It checks whether the sender is a registered property owner and reverts with an error message if not.
     * If the condition is met, the function execution continues.
     */
    modifier onlyPropertyOwners() {
        require(
            registeredOwners[msg.sender] == true,
            "You're not a certified diagnostician"
        );
        _;
    }

    //////// FUNCTIONS

    /**
     * @dev Function that returns the role and certification status of the caller.
     * The possible roles are SmartContractOwner, PropertyOwner, CertifiedDiagnostician,
     * UncertifiedDiagnostician, and NoRole.
     * @return UserInfo memory object containing the role and certification status of the caller.
     */
    function myself() public view returns (UserInfo memory) {
        if (msg.sender == owner()) {
            return UserInfo({role: "SmartContractOwner", isCertified: false});
        } else if (registeredOwners[msg.sender]) {
            return UserInfo({role: "PropertyOwner", isCertified: false});
        } else if (verifiedDiagnostician[msg.sender].isCertified) {
            return
                UserInfo({role: "CertifiedDiagnostician", isCertified: true});
        } else if (
            verifiedDiagnostician[msg.sender].pendingVerification == true
        ) {
            return
                UserInfo({
                    role: "UncertifiedDiagnostician",
                    isCertified: false
                });
        } else {
            return UserInfo({role: "NoRole", isCertified: false});
        }
    }

    /**
     * @dev Function that allows users to register as a property owner.
     * The function checks if the sent value is greater than or equal to the registration fee and
     * if the sender is not already a registered owner. If both conditions are met, the sender
     * is registered as a property owner and the OwnerRegistered event is emitted.
     */
    function registerOwner() public payable {
        require(msg.value >= registrationFee, "Incorrect registration fee");
        require(!registeredOwners[msg.sender], "Owner already registered");
        registeredOwners[msg.sender] = true;
        emit OwnerRegistered(msg.sender);
    }

    /**
     * @dev Function that allows uncertified diagnosticians to request verification.
     * The function checks if the sender is not already certified, and if so, stores their
     * information and sets their pendingVerification status to true. It also emits an
     * AskedVerification event.
     * @param _name The name of the diagnostician.
     * @param _siret The SIRET identifier of the diagnostician.
     */
    function requestVerification(
        string memory _name,
        string memory _siret
    ) external onlyUnCertifiedDiagnosticians {
        require(
            verifiedDiagnostician[msg.sender].isCertified == false,
            "Already certified"
        );
        address requester = msg.sender;
        verifiedDiagnostician[requester].name = _name;
        verifiedDiagnostician[requester].isCertified = false;
        verifiedDiagnostician[requester].pendingVerification = true;
        siretToDiagnostician[_siret] = msg.sender;
        emit AskedVerification(requester);
    }

    /**
     * @dev Function that allows the smart contract owner to verify a diagnostician.
     * The function checks if the diagnostician is not already certified, and if so, sets their
     * isCertified status to true and pendingVerification status to false. It also emits a
     * DiagnosticianCertified event.
     * @param _diagnostician The address of the diagnostician to be verified.
     */
    function verifyDiagnostician(address _diagnostician) public onlyOwner {
        require(
            verifiedDiagnostician[_diagnostician].isCertified == false,
            "Already certified"
        );
        verifiedDiagnostician[_diagnostician].isCertified = true;
        verifiedDiagnostician[_diagnostician].pendingVerification = false;
        emit DiagnosticianCertified(_diagnostician);
    }

    /**
     * @dev Function that allows property owners to create a new property.
     * The function calls the createProperty function of the PropertyFactory contract and emits a
     * PropertyCreated event.
     * @param _name The name of the property.
     * @param _symbol The symbol of the property.
     * @return The address of the created property.
     */
    function createProperty(
        string memory _name,
        string memory _symbol
    ) public onlyPropertyOwners returns (address) {
        address propertyAddress = _propertyFactory.createProperty(
            _name,
            _symbol
        );

        emit PropertyCreated(propertyAddress);
        return propertyAddress;
    }

    /**
     * @dev Function that allows property owners to request a diagnostic.
     * The function creates a new DiagnosticRequest struct, stores it in the diagnosticRequests
     * mapping, and emits a DiagnosticRequested event.
     * @param _propertyAddress The address of the property to be diagnosed.
     * @param _diagnostician The address of the certified diagnostician.
     */
    function requestDiagnostic(
        address _propertyAddress,
        address _diagnostician
    ) public onlyPropertyOwners {
        require(_propertyAddress != address(0), "Invalid property address");

        DiagnosticRequest memory newRequest = DiagnosticRequest({
            propertyOwner: msg.sender,
            property: _propertyAddress,
            isCompleted: false
        });

        uint256 requestId = diagnosticRequests[_diagnostician].length;
        diagnosticRequests[_diagnostician].push(newRequest);
        emit DiagnosticRequested(
            requestId,
            msg.sender,
            _diagnostician,
            _propertyAddress
        );
    }

    /**
     * @dev Function that allows certified diagnosticians to create a diagnostic.
     * The function checks if the requestId is valid and if a diagnostic request exists for the
     * given requestId. It then calls the createDiagnostic function of the PropertyFactory contract,
     * marks the request as completed, and emits a DiagnosticCreated event.
     * @param requestId The identifier of the diagnostic request.
     * @param _documentHash The IPFS hash of the diagnostic document.
     * @param _tokenURI The URI of the diagnostic token.
     * @param _expiryDate The expiry date of the diagnostic in UNIX timestamp format.
     */
    function createDiagnostic(
        uint256 requestId,
        string memory _documentHash,
        string memory _tokenURI,
        uint256 _expiryDate
    ) public onlyCertifiedDiagnosticians {
        require(
            requestId < diagnosticRequests[msg.sender].length,
            "Invalid request ID"
        );
        require(
            diagnosticRequests[msg.sender][requestId].property != address(0),
            "No diagnostic request found"
        );
        address property = diagnosticRequests[msg.sender][requestId].property;
        uint256 tokenId = _propertyFactory.createDiagnostic(
            property,
            _documentHash,
            _tokenURI,
            _expiryDate
        );
        diagnosticRequests[msg.sender][requestId].isCompleted = true;

        emit DiagnosticCreated(property, tokenId);
    }

    /**
     * @dev Function that allows property owners to transfer ownership of a diagnostic token.
     * The function calls the transferOwnership function of the PropertyFactory contract.
     * @param _property The address of the property associated with the diagnostic token.
     * @param _to The address to transfer the ownership of the token to.
     * @param _tokenId The identifier of the diagnostic token.
     */
    function transferOwnership(
        address _property,
        address _to,
        uint256 _tokenId
    ) public onlyPropertyOwners {
        _propertyFactory.transferOwnership(_property, _to, _tokenId);
    }

    /**
     * @dev Function that revokes the verification status of a diagnostician.
     * Only the smart contract owner can call this function. The function sets
     * the isCertified status of the diagnostician to false and emits a
     * DiagnosticianRevoked event.
     * @param _diagnostician The address of the diagnostician whose verification status is to be revoked.
     */
    function revokeDiagnosticianVerification(
        address _diagnostician
    ) public onlyOwner {
        require(
            verifiedDiagnostician[_diagnostician].isCertified == true,
            "Already uncertified"
        );
        verifiedDiagnostician[_diagnostician].isCertified = false;
        emit DiagnosticianRevoked(_diagnostician);
    }

    /**
     * @dev Private function that checks if a diagnostician is verified (certified).
     * @param diagnostician The address of the diagnostician to check.
     * @return A boolean value indicating if the diagnostician is certified.
     */
    function _isDiagnosticianVerified(
        address diagnostician
    ) private view returns (bool) {
        return verifiedDiagnostician[diagnostician].isCertified;
    }

    /**
     * @dev Function that allows the smart contract owner to withdraw the accumulated funds.
     * The function transfers the contract balance to the provided recipient address and emits
     * a FundsWithdrawn event.
     * @param _recipient The address of the recipient to receive the funds.
     */
    function withdrawFunds(address payable _recipient) public onlyOwner {
        _recipient.transfer(address(this).balance);
        emit FundsWithdrawn(address(this));
    }

    /**
     * @dev Function that allows the smart contract owner to set a new registration fee.
     * @param _newFee The new registration fee value.
     */
    function setRegistrationFee(uint256 _newFee) public onlyOwner {
        registrationFee = _newFee;
    }

    /**
     * @dev Function that returns an array of DiagnosticRequest structs for a certified diagnostician.
     * @param _diagnostician The address of the certified diagnostician.
     * @return An array of DiagnosticRequest structs.
     */
    function getDiagnosticRequests(
        address _diagnostician
    )
        public
        view
        onlyCertifiedDiagnosticians
        returns (DiagnosticRequest[] memory)
    {
        return diagnosticRequests[_diagnostician];
    }

    /**
     * @dev Function that retrieves the IPFS hash of a diagnostic associated with a property and a token ID.
     * @param property The address of the property associated with the diagnostic.
     * @param tokenId The identifier of the diagnostic token.
     * @return The IPFS hash of the diagnostic document.
     */
    function getDiagnosticHash(
        address property,
        uint256 tokenId
    ) public view returns (string memory) {
        return _propertyFactory.getDiagnosticHash(property, tokenId);
    }

    /**
     * @dev Function that returns an array of Property structs for the calling user.
     * @return An array of Property structs.
     */
    function getUserProperties() public view returns (Property[] memory) {
        return _propertyFactory.getUserProperties();
    }
}
