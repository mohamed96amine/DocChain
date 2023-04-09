// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.18;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/draft-ERC721Votes.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./Property.sol";

contract PropertyFactory {
    // property Owner to list of properties
    mapping(address => Property[]) public userProperties;

    // property contract address to property
    mapping(address => Property) public properties;

    constructor() {}

    function createProperty(string memory _name, string memory _symbol)
        public
        returns (address)
    {
        Property newProperty = new Property(_name, _symbol);
        userProperties[msg.sender].push(newProperty);
        address propertyAddress = address(newProperty);
        properties[propertyAddress] = newProperty;
        return propertyAddress;
    }

    function createDiagnostic(
        address _property,
        string memory _documentHash,
        string memory _tokenURI,
        uint256 _expiryDate
    ) public returns (uint256) {
        uint256 tokenId = properties[_property].safeMint(
            msg.sender,
            _tokenURI,
            _expiryDate
        );
        properties[_property].setDocumentHash(tokenId, _documentHash);
        return tokenId;
    }

    function getPropertyContract(address property)
        public
        view
        returns (Property)
    {
        return properties[property];
    }

    function getUserProperties()
        public
        view
        returns (Property[] memory)
    {
        return userProperties[msg.sender];
    }

    function getDiagnosticHash(address property, uint256 tokenId)
        public
        view
        returns (string memory)
    {
        return properties[property].getDocumentHash(tokenId);
    }

    function transferOwnership(
        address _property,
        address _to,
        uint256 _tokenId
    ) public {
        properties[_property].transferFrom(msg.sender, _to, _tokenId);
    }

}
