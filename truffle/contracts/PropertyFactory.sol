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

/**
 * @title PropertyFactory Contract
 * @author EL BACHRA
 * @notice TPropertyFactory is a smart contract that manages the creation of
 *  Property contracts and the minting of diagnostics as ERC721 tokens.
 * The contract allows users to create new Property contracts, create diagnostic tokens
 * with a document hash and token URI, and transfer tokens between users.
 * Each user can have multiple Property contracts, and each contract can have multiple
 * diagnostic tokens associated with it.
 */
contract PropertyFactory {
    // property Owner to list of properties
    mapping(address => Property[]) public userProperties;

    // property contract address to property
    mapping(address => Property) public properties;

    constructor() {}

    /**
     * @dev Function to create a new Property contract and store its reference.
     * @param _name The name of the Property contract.
     * @param _symbol The symbol of the Property contract.
     * @return propertyAddress The address of the newly created Property contract.
     */
    function createProperty(
        string memory _name,
        string memory _symbol
    ) public returns (address) {
        Property newProperty = new Property(_name, _symbol);
        userProperties[msg.sender].push(newProperty);
        address propertyAddress = address(newProperty);
        properties[propertyAddress] = newProperty;
        return propertyAddress;
    }

    /**
     * @dev Function to create a new diagnostic, mint a token associated with it, and set the document hash.
     * @param _property The address of the Property contract associated with the diagnostic.
     * @param _documentHash The hash of the document related to the diagnostic.
     * @param _tokenURI The URI for the token metadata.
     * @param _expiryDate The expiration date of the diagnostic.
     * @return tokenId The ID of the newly minted token associated with the diagnostic.
     */
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

    /**
     * @dev Returns the Property contract associated with the given property address.
     * @param property The address of the Property contract.
     * @return A `Property` object representing the Property contract.
     */
    function getPropertyContract(
        address property
    ) public view returns (Property) {
        return properties[property];
    }

    /**
     * @dev Returns an array of `Property` objects owned by the caller of the function.
     * @return An array of `Property` objects owned by the caller of the function.
     */
    function getUserProperties() public view returns (Property[] memory) {
        return userProperties[msg.sender];
    }

    /**
     * @dev Returns the document hash associated with the given property and token ID.
     * @param property The address of the Property contract.
     * @param tokenId The ID of the token representing the diagnostic report.
     * @return A string representing the document hash associated with the diagnostic report.
     */
    function getDiagnosticHash(
        address property,
        uint256 tokenId
    ) public view returns (string memory) {
        return properties[property].getDocumentHash(tokenId);
    }

    /**
     * @dev Transfers ownership of a token representing a diagnostic report to a new owner.
     * @param _property The address of the Property contract.
     * @param _to The address of the new owner.
     * @param _tokenId The ID of the token representing the diagnostic report.
     */
    function transferOwnership(
        address _property,
        address _to,
        uint256 _tokenId
    ) public {
        properties[_property].transferFrom(msg.sender, _to, _tokenId);
    }
}
