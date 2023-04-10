// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.18;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

/**
 * @title Property Contract
 * @author EL BACHRA
 * @notice This contract allows for the creation, management, and validation of ERC721 tokens representing real estate properties.
 * Each token has a unique identifier and contains a link to a immutable PDF document of the real estate diagnostic report.
 */
contract Property is ERC721, ERC721URIStorage, IERC721Receiver {
    using Counters for Counters.Counter;
    mapping(uint256 => string) private _pdfHashes;
    mapping(uint256 => bool) private _pdfHashSet;
    mapping(uint256 => uint256) private creationTime;
    mapping(uint256 => uint256) private expiryDate;
    Counters.Counter private _tokenIdCounter;

    constructor(
        string memory name,
        string memory symbol
    ) ERC721(name, symbol) {}

    function _baseURI() internal pure override returns (string memory) {
        return "";
    }

    /**
     * @notice Associates a document hash with the specified token ID.
     * @dev Requires that the document hash has not already been set for the given token ID.
     * @param _tokenId The token ID to associate with the document hash.
     * @param _documentHash The document hash to be associated with the token ID.
     */
    function setDocumentHash(
        uint256 _tokenId,
        string memory _documentHash
    ) public {
        require(
            !_pdfHashSet[_tokenId],
            "Document hash has already been set for this token ID"
        );
        _pdfHashes[_tokenId] = _documentHash;
        _pdfHashSet[_tokenId] = true;
    }

    /**
     * @notice Retrieves the document hash associated with the specified token ID.
     * @dev Requires that the token ID exists.
     * @param tokenId The token ID to query the document hash for.
     * @return The document hash associated with the token ID.
     */
    function getDocumentHash(
        uint256 tokenId
    ) public view returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        return _pdfHashes[tokenId];
    }

    /**
     * @notice Safely mints a new ERC721 token with the specified URI and expiry date.
     * @dev Requires that the expiry date is in the future.
     * @param to The address that the newly minted token will be assigned to.
     * @param uri The URI associated with the token.
     * @param _expiryDate The expiry date of the token.
     * @return The token ID of the newly minted token.
     */
    function safeMint(
        address to,
        string memory uri,
        uint256 _expiryDate
    ) public returns (uint256) {
        uint256 currentTime = block.timestamp;
        require(
            _expiryDate > currentTime,
            "Expiry date should be in the future"
        );
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _mint(to, tokenId);
        _setTokenURI(tokenId, uri);
        creationTime[tokenId] = currentTime;
        expiryDate[tokenId] = _expiryDate;
        return tokenId;
    }

    /**
     * @notice Checks whether a token with the specified token ID is valid.
     * @dev Requires that the token ID exists.
     * @param tokenId The token ID to check for validity.
     * @return A boolean value indicating whether the token is valid or not.
     */
    function isValid(uint256 tokenId) public view returns (bool) {
        require(_exists(tokenId), "Token does not exist");
        return block.timestamp < expiryDate[tokenId];
    }

    /**
     * @notice Retrieves the token URI associated with the specified token ID.
     * @dev Requires that the token ID exists.
     * @param tokenId The token ID to query the token URI for.
     * @return The token URI associated with the token ID.
     */
    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    /**
     * @notice Burns a token with the specified token ID.
     * @dev Overrides the _burn function of the parent contracts.
     * @param tokenId The token ID to be burned.
     */
    function _burn(
        uint256 tokenId
    ) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    /**
     * @notice Handles the receipt of an ERC721 token.
     * @dev Returns the selector of the onERC721Received function.
     * @param operator The address which called the safeTransferFrom function.
     * @param from The address which previously owned the token.
     * @param tokenId The token ID being transferred.
     * @param data Additional data with no specified format.
     * @return The selector of the onERC721Received function.
     */
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
}
