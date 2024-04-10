export default function Loading() {
	return (
		<div
			style={{
				height: '600px',
				width: '100%',
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<p
				style={{
					fontSize: '24px',
					fontWeight: 'bold',
					textTransform: 'uppercase',
				}}
			>
				Loading...
			</p>
		</div>
	);
}
