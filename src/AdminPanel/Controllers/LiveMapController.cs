﻿// <copyright file="LiveMapController.cs" company="MUnique">
// Licensed under the MIT License. See LICENSE file in the project root for full license information.
// </copyright>

namespace MUnique.OpenMU.AdminPanel.Controllers
{
    using System.Collections.Generic;
    using System.IO;
    using System.Linq;
    using log4net;
    using Microsoft.AspNetCore.Mvc;
    using MUnique.OpenMU.GameLogic;
    using MUnique.OpenMU.Interfaces;
    using SixLabors.ImageSharp;
    using SixLabors.ImageSharp.PixelFormats;

    /// <summary>
    /// Controller for all map related functions.
    /// </summary>
    [Route("admin/[controller]")]
    public class LiveMapController : Controller
    {
        private static readonly ILog Log = LogManager.GetLogger(typeof(LiveMapController));
        private readonly IList<IManageableServer> servers;

        /// <summary>
        /// Initializes a new instance of the <see cref="LiveMapController"/> class.
        /// </summary>
        /// <param name="servers">The servers.</param>
        public LiveMapController(IList<IManageableServer> servers)
        {
            this.servers = servers;
        }

        /// <summary>
        /// Returns the live map view.
        /// </summary>
        /// <returns>The live map view.</returns>
        [HttpGet]
        public IActionResult Index() => this.View("Index");

        /// <summary>
        /// Renders and returns the terrain of the specified server and map identifier.
        /// </summary>
        /// <param name="serverId">The server identifier.</param>
        /// <param name="mapId">The map identifier.</param>
        /// <returns>The rendered terrain.</returns>
        [HttpGet("Terrain/{serverId}/{mapId}")]
        public IActionResult Terrain(int serverId, int mapId)
        {
            var gameServer = this.servers.OfType<IGameServer>().FirstOrDefault(s => s.Id == serverId);

            var map = gameServer?.ServerInfo.Maps.FirstOrDefault(m => m.MapNumber == mapId);
            if (map == null)
            {
                Log.Warn($"requested map not available. map number: {mapId}; server id: {serverId}");
                return this.NotFound();
            }

            this.Response.ContentType = "image/png";
            using (var mapStream = this.RenderMap(map))
            {
                // we need to set the length before writing the data into the body,
                // otherwise it gets "chunked".
                this.Response.ContentLength = mapStream.Length;
                mapStream.CopyTo(this.Response.Body);
                return this.Ok();
            }
        }

        private Stream RenderMap(IGameMapInfo map)
        {
            var terrain = new GameMapTerrain(map.MapName, map.TerrainData);
            using (var bitmap = new Image<Rgba32>(0x100, 0x100))
            {
                for (int y = 0; y < 0x100; y++)
                {
                    for (int x = 0; x < 0x100; x++)
                    {
                        var color = Rgba32.Black;
                        if (terrain.SafezoneMap[y, x])
                        {
                            color = Rgba32.Gray;
                        }
                        else if (terrain.WalkMap[y, x])
                        {
                            color = Rgba32.SpringGreen;
                        }
                        else
                        {
                            // we use the default color.
                        }

                        bitmap[x, y] = color;
                    }
                }

                var memoryStream = new MemoryStream();
                bitmap.SaveAsPng(memoryStream);
                memoryStream.Position = 0;
                return memoryStream;
            }
        }
    }
}
