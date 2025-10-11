import { DataSource } from "@/db/schema";

export const DataSourceSelector = ({
	dataSources,
}: {
	dataSources: DataSource[],
}) => {
	return (
		<div className="w-full h-60 rounded-sm bg-input/10 
			grid grid-cols-7 gap-4 p-2 ">
			{dataSources.map((ds: DataSource) => {
				return (
					<div key={ds.id} className="h-fit flex flex-col 
						items-center justify-between p-2 cursor-pointer 						
						border-input/30 bg-input/20
						border-2 border-b-6 active:border-b-2 hover:border-b-4 
						hover:translate-y-0.5 active:translate-y-1">
						<img className="h-16 w-16 rounded-sm"
							alt={ds.name} src={
								ds.id === "yc" ? "/yc.webp" :
									ds.id === "tr" ? "/tr.png" :
										ds.id === "bwj" ? "/bwj.jpg" :
											"/custom.jpg"
							} />
						<p className="text-sm text-center line-clamp-1">
							{ds.name}
						</p>
					</div>
				);
			})}
		</div>
	);
}
