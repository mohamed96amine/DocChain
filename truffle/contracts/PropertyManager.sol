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

contract PropertyManager is Ownable {
    struct Diagnostician {
        string name;
        bool pendingVerification;
        bool isCertified;
        uint256 price;
    }

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
    constructor(address propertyFactoryAddress) {
        _propertyFactory = PropertyFactory(propertyFactoryAddress);
    }

    //////// EVENTS
    event DiagnosticRequested(
        uint256 requestId,
        address propertyOwner,
        address diagnostician,
        address propertyAddress
    );
    event DiagnosticCreated(address indexed property, uint256 indexed tokenId);
    event PropertyCreated(address indexed property);
    event AskedVerification(address diagnosticianAddress);
    event DiagnosticianCertified(address diagnosticianAddress);
    event DiagnosticianRevoked(address diagnosticianAddress);
    event OwnerRegistered(address ownerAddress);
    event FundsWithdrawn(address account);
    event DiagnosticRequested(
        uint256 requestId,
        address propertyOwner,
        string propertyAddress
    );

    //////// MODIFIERS
    modifier onlyCertifiedDiagnosticians() {
        require(
            verifiedDiagnostician[msg.sender].isCertified == true,
            "You're not a certified diagnostician"
        );
        _;
    }

    modifier onlyUnCertifiedDiagnosticians() {
        require(
            verifiedDiagnostician[msg.sender].isCertified == false,
            "You're a certified diagnostician"
        );
        _;
    }

    modifier onlyPropertyOwners() {
        require(
            registeredOwners[msg.sender] == true,
            "You're not a certified diagnostician"
        );
        _;
    }

    //////// FUNCTIONS

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

    function registerOwner() public payable {
        require(msg.value >= registrationFee, "Incorrect registration fee");
        require(!registeredOwners[msg.sender], "Owner already registered");
        registeredOwners[msg.sender] = true;
        emit OwnerRegistered(msg.sender);
    }

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

    function verifyDiagnostician(address _diagnostician) public onlyOwner {
        require(
            verifiedDiagnostician[_diagnostician].isCertified == false,
            "Already certified"
        );
        verifiedDiagnostician[_diagnostician].isCertified = true;
        verifiedDiagnostician[_diagnostician].pendingVerification = false;
        emit DiagnosticianCertified(_diagnostician);
    }

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

    function transferOwnership(
        address _property,
        address _to,
        uint256 _tokenId
    ) public onlyPropertyOwners {
        _propertyFactory.transferOwnership(_property, _to, _tokenId);
    }

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

    function _isDiagnosticianVerified(
        address diagnostician
    ) private view returns (bool) {
        return verifiedDiagnostician[diagnostician].isCertified;
    }

    function withdrawFunds(address payable _recipient) public onlyOwner {
        // Implement withdrawal logic, e.g., onlyOwner modifier
        _recipient.transfer(address(this).balance);
        emit FundsWithdrawn(address(this));
    }

    function setRegistrationFee(uint256 _newFee) public onlyOwner {
        registrationFee = _newFee;
    }

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

    function getDiagnosticHash(
        address property,
        uint256 tokenId
    ) public view returns (string memory) {
        return _propertyFactory.getDiagnosticHash(property, tokenId);
    }

    function getUserProperties() public view returns (Property[] memory) {
        return _propertyFactory.getUserProperties();
    }
}
