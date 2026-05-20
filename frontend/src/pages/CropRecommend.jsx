            {results && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-white drop-shadow flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Top 5 Recommendations
                </h2>

                {results.map((crop, i) => (
                  <div
                    key={crop.name}
                    className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-lg"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-white/10 text-xs font-bold text-white flex items-center justify-center">
                          {i + 1}
                        </span>
                        <span className="font-semibold text-white">{crop.name}</span>
                      </div>

                      <span className="text-sm font-medium text-green-400">
                        {crop.match}% match
                      </span>
                    </div>

                    {/* Match bar */}
                    <div className="w-full h-2 bg-white/10 rounded-full mb-3">
                      <div
                        className="h-2 bg-green-500 rounded-full"
                        style={{ width: `${crop.match}%` }}
                      />
                    </div>

                    {/* Tip */}
                    <p className="text-xs text-white/50 mb-3">
                      {crop.tip}
                    </p>

                    {/* Profit section */}
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-white/10 rounded-lg py-2">
                        <p className="text-xs text-white/50 mb-0.5">
                          Revenue/acre
                        </p>

                        <p className="text-sm font-semibold text-white flex items-center justify-center gap-0.5">
                          <IndianRupee className="w-3.5 h-3.5" />
                          {crop.revenue.toLocaleString("en-IN")}
                        </p>
                      </div>

                      <div className="bg-white/10 rounded-lg py-2">
                        <p className="text-xs text-white/50 mb-0.5">
                          Est. Cost
                        </p>

                        <p className="text-sm font-semibold text-white flex items-center justify-center gap-0.5">
                          <IndianRupee className="w-3.5 h-3.5" />
                          {crop.cost.toLocaleString("en-IN")}
                        </p>
                      </div>

                      <div className="bg-white/10 rounded-lg py-2">
                        <p className="text-xs text-white/50 mb-0.5">
                          Profit
                        </p>

                        <p className="text-sm font-semibold text-green-400 flex items-center justify-center gap-0.5">
                          <IndianRupee className="w-3.5 h-3.5" />
                          {crop.profit.toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}