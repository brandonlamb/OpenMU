﻿// <copyright file="ItemStorage.cs" company="MUnique">
// Licensed under the MIT License. See LICENSE file in the project root for full license information.
// </copyright>

namespace MUnique.OpenMU.DataModel.Entities
{
    using System.Collections.Generic;

    /// <summary>
    /// A storage where items can be stored.
    /// </summary>
    public class ItemStorage
    {
        /// <summary>
        /// Gets or sets the items which are stored.
        /// </summary>
        public virtual ICollection<Item> Items { get; protected set; }

        /// <summary>
        /// Gets or sets the money which is stored.
        /// </summary>
        public int Money { get; set; }
    }
}
